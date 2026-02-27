use anyhow::{anyhow, Result};
use ort::session::{Session, builder::GraphOptimizationLevel};
use ort::value::Value;
use ort::execution_providers::{CUDAExecutionProvider, CoreMLExecutionProvider, DirectMLExecutionProvider};
use sysinfo::System;
use tokenizers::Tokenizer;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelTier {
    Micro,
    Small,
    Medium,
    Large,
    Macro,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ModelTask {
    Chat,
    Predict,
    Categorise,
}

pub struct ModelConfig {
    pub llm_path: PathBuf,
    pub embedding_path: PathBuf,
    pub tokenizer_path: PathBuf,
}

pub struct ModelManager {
    pub tier: ModelTier,
}

impl ModelManager {
    pub fn new() -> Self {
        let mut sys = System::new_all();
        sys.refresh_memory();
        let total_ram = sys.total_memory() / 1024 / 1024 / 1024; // GB

        let tier = if total_ram < 1 {
            ModelTier::Micro
        } else if total_ram < 2 {
            ModelTier::Small
        } else if total_ram < 4 {
            ModelTier::Medium
        } else if total_ram < 8 {
            ModelTier::Large
        } else {
            ModelTier::Macro
        };

        Self { tier }
    }

    pub fn get_config(&self, task: ModelTask) -> ModelConfig {
        let tier_name = format!("{:?}", self.tier).to_lowercase();

        // For Micro/Small tiers, we might use the same model for both to save RAM,
        // but point to a 'predict' optimized one if available.
        let base_path = PathBuf::from("models").join(&tier_name);

        let llm_filename = match (self.tier.clone(), task) {
            (ModelTier::Micro, ModelTask::Predict) => "qwen2-0.5b-instruct.onnx",
            (ModelTier::Micro, ModelTask::Categorise) => "qwen2-0.5b-instruct.onnx",
            (ModelTier::Micro, ModelTask::Chat) => "qwen2-0.5b-instruct.onnx", // Shared for Micro
            (ModelTier::Small, ModelTask::Predict) => "qwen2-1.5b-instruct.onnx",
            (ModelTier::Small, ModelTask::Categorise) => "qwen2-1.5b-instruct.onnx",
            (ModelTier::Small, ModelTask::Chat) => "phi-3-mini-instruct.onnx",
            (_, ModelTask::Predict) => "qwen2-7b-instruct.onnx",
            (_, ModelTask::Categorise) => "qwen2-7b-instruct.onnx",
            (_, ModelTask::Chat) => "llama-3-8b-instruct.onnx",
        };

        ModelConfig {
            llm_path: base_path.join(llm_filename),
            embedding_path: base_path.join("embedding.onnx"),
            tokenizer_path: base_path.join("tokenizer.json"),
        }
    }
}

pub struct LlmEngine {
    session: Session,
    tokenizer: Tokenizer,
}

impl LlmEngine {
    pub fn new(config: &ModelConfig) -> Result<Self> {
        let session = Session::builder()?
            .with_optimization_level(GraphOptimizationLevel::Level3)?
            .with_execution_providers([
                CUDAExecutionProvider::default().build(),
                CoreMLExecutionProvider::default().build(),
                DirectMLExecutionProvider::default().build(),
            ])?
            .commit_from_file(&config.llm_path)?;

        let tokenizer = Tokenizer::from_file(&config.tokenizer_path)
            .map_err(|e| anyhow!("Failed to load tokenizer: {}", e))?;

        Ok(Self { session, tokenizer })
    }

    pub fn generate(&mut self, prompt: &str, max_tokens: usize) -> Result<String> {
        let mut tokens = self.tokenizer.encode(prompt, true)
            .map_err(|e| anyhow!("Tokenization error: {}", e))?
            .get_ids()
            .to_vec();

        let mut generated_text = String::new();
        let eos_token_id = self.tokenizer.get_vocab(true).get("</s>").cloned().unwrap_or(2);

        for _ in 0..max_tokens {
            let input_ids_i64: Vec<i64> = tokens.iter().map(|&x| x as i64).collect();
            let input_shape = vec![1, tokens.len()];
            let attention_mask = vec![1i64; tokens.len()];

            let input_value = Value::from_array((input_shape.clone(), input_ids_i64))?;
            let mask_value = Value::from_array((input_shape, attention_mask))?;

            let outputs = self.session.run(ort::inputs![
                "input_ids" => input_value,
                "attention_mask" => mask_value
            ])?;

            let (logits_shape, logits_data) = outputs["logits"].try_extract_tensor::<f32>()?;
            let seq_len = logits_shape[1] as usize;
            let vocab_size = logits_shape[2] as usize;
            let last_token_logits = &logits_data[(seq_len - 1) * vocab_size .. seq_len * vocab_size];

            let mut next_token_id = 0;
            let mut max_logit = f32::MIN;
            for (i, &logit) in last_token_logits.iter().enumerate() {
                if logit > max_logit {
                    max_logit = logit;
                    next_token_id = i;
                }
            }

            if next_token_id as u32 == eos_token_id {
                break;
            }

            tokens.push(next_token_id as u32);
            let decoded = self.tokenizer.decode(&[next_token_id as u32], true)
                .map_err(|e| anyhow!("Decoding error: {}", e))?;
            generated_text.push_str(&decoded);

            if generated_text.ends_with("\n") { // Heuristic
                break;
            }
        }

        Ok(generated_text)
    }
}

pub struct EmbeddingEngine {
    session: Session,
    tokenizer: Tokenizer,
}

impl EmbeddingEngine {
    pub fn new(config: &ModelConfig) -> Result<Self> {
        let session = Session::builder()?
            .with_execution_providers([
                CUDAExecutionProvider::default().build(),
                CoreMLExecutionProvider::default().build(),
            ])?
            .commit_from_file(&config.embedding_path)?;

        let tokenizer = Tokenizer::from_file(&config.tokenizer_path)
            .map_err(|e| anyhow!("Failed to load tokenizer: {}", e))?;

        Ok(Self { session, tokenizer })
    }

    pub fn embed(&mut self, text: &str) -> Result<Vec<f32>> {
        let encoding = self.tokenizer.encode(text, true)
            .map_err(|e| anyhow!("Tokenization error: {}", e))?;

        let input_ids = encoding.get_ids();
        let input_ids_i64: Vec<i64> = input_ids.iter().map(|&x| x as i64).collect();
        let input_shape = vec![1, input_ids.len()];
        let attention_mask = vec![1i64; input_ids.len()];

        let input_value = Value::from_array((input_shape.clone(), input_ids_i64))?;
        let mask_value = Value::from_array((input_shape, attention_mask))?;

        let outputs = self.session.run(ort::inputs![
            "input_ids" => input_value,
            "attention_mask" => mask_value
        ])?;
        let (embeddings_shape, embeddings_data) = outputs["last_hidden_state"].try_extract_tensor::<f32>()?;

        let seq_len = embeddings_shape[1] as usize;
        let hidden_size = embeddings_shape[2] as usize;

        let mut mean_vec = vec![0.0f32; hidden_size];
        for i in 0..seq_len {
            for j in 0..hidden_size {
                mean_vec[j] += embeddings_data[i * hidden_size + j];
            }
        }

        for j in 0..hidden_size {
            mean_vec[j] /= seq_len as f32;
        }

        Ok(mean_vec)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_model_manager_tier() {
        let manager = ModelManager::new();
        // Just verify it doesn't panic and returns a valid tier
        println!("Detected tier: {:?}", manager.tier);
    }

    #[test]
    fn test_model_config_paths() {
        let manager = ModelManager::new();
        let config = manager.get_config(ModelTask::Chat);
        // Paths will vary based on tier, but should contain the base models dir
        assert!(config.llm_path.to_str().unwrap().contains("models"));
        assert!(config.embedding_path.to_str().unwrap().contains("embedding.onnx"));
        assert!(config.tokenizer_path.to_str().unwrap().contains("tokenizer.json"));
    }
}
