use ort::session::{Session, builder::SessionBuilder};
use ort::execution_providers::{CUDAExecutionProvider, CoreMLExecutionProvider, DirectMLExecutionProvider};
use tokenizers::Tokenizer;
use crate::onnx::model_manager::ModelManager;

pub struct InferenceEngine {
    llm_session: Option<Session>,
    embedding_session: Option<Session>,
    tokenizer: Option<Tokenizer>,
}

impl InferenceEngine {
    pub fn new(model_manager: &ModelManager) -> anyhow::Result<Self> {
        let _ = ort::init();

        let llm_path = model_manager.get_model_path("llm");
        let emb_path = model_manager.get_model_path("embedding");

        fn create_session(path: &str) -> anyhow::Result<Session> {
            let builder = SessionBuilder::new()?;

            // Attempt to add hardware acceleration providers
            let builder = builder
                .with_execution_providers([
                    CUDAExecutionProvider::default().build(),
                    CoreMLExecutionProvider::default().build(),
                    DirectMLExecutionProvider::default().build(),
                ])
                .ok() // Fallback to default if EPs fail to register
                .unwrap_or(SessionBuilder::new()?);

            Ok(builder.commit_from_file(path)?)
        }

        let llm_session = create_session(&llm_path).ok();
        let embedding_session = create_session(&emb_path).ok();

        let tokenizer = Tokenizer::from_file("models/tokenizer.json").ok();

        Ok(Self {
            llm_session,
            embedding_session,
            tokenizer,
        })
    }

    pub fn generate(&self, prompt: &str, _max_tokens: usize) -> anyhow::Result<String> {
        let _session = self.llm_session.as_ref().ok_or_else(|| anyhow::anyhow!("LLM session not initialized"))?;
        let tokenizer = self.tokenizer.as_ref().ok_or_else(|| anyhow::anyhow!("Tokenizer not initialized"))?;

        // Simple tokenization example
        let encoding = tokenizer.encode(prompt, true)
            .map_err(|e| anyhow::anyhow!("Tokenization error: {}", e))?;
        let _input_ids = encoding.get_ids();

        // In a real implementation, we would convert input_ids to an ndarray tensor,
        // run the session, and decode the output tokens.

        Ok("Generated text from ONNX (Tokenized)".to_string())
    }

    pub fn get_embeddings(&self, text: &str) -> anyhow::Result<Vec<f32>> {
        let _session = self.embedding_session.as_ref().ok_or_else(|| anyhow::anyhow!("Embedding session not initialized"))?;
        let tokenizer = self.tokenizer.as_ref().ok_or_else(|| anyhow::anyhow!("Tokenizer not initialized"))?;

        let _encoding = tokenizer.encode(text, true)
            .map_err(|e| anyhow::anyhow!("Tokenization error: {}", e))?;

        Ok(vec![0.1, 0.2, 0.3])
    }
}
