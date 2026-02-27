use sys_info;
use serde::Serialize;

#[derive(Debug, Clone, Copy, Serialize)]
pub enum ModelTier {
    Micro,
    Small,
    Medium,
    Large,
    Macro,
}

pub struct ModelManager {
    pub tier: ModelTier,
}

impl ModelManager {
    pub fn new() -> anyhow::Result<Self> {
        let mem_info = sys_info::mem_info()?;
        let total_ram_kb = mem_info.total;
        let total_ram_gb = total_ram_kb as f64 / 1024.0 / 1024.0;

        let tier = if total_ram_gb < 1.0 {
            ModelTier::Micro
        } else if total_ram_gb < 2.0 {
            ModelTier::Small
        } else if total_ram_gb < 4.0 {
            ModelTier::Medium
        } else if total_ram_gb < 8.0 {
            ModelTier::Large
        } else {
            ModelTier::Macro
        };

        println!("Detected System RAM: {:.2} GB. Selecting Tier: {:?}", total_ram_gb, tier);

        Ok(Self { tier })
    }

    pub fn get_model_path(&self, model_type: &str) -> String {
        match (model_type, self.tier) {
            ("llm", ModelTier::Micro) => "models/llm/micro.onnx".to_string(),
            ("llm", ModelTier::Small) => "models/llm/small.onnx".to_string(),
            ("llm", ModelTier::Medium) => "models/llm/medium.onnx".to_string(),
            ("llm", ModelTier::Large) => "models/llm/large.onnx".to_string(),
            ("llm", ModelTier::Macro) => "models/llm/macro.onnx".to_string(),
            ("embedding", _) => "models/embedding/default.onnx".to_string(),
            _ => "models/llm/small.onnx".to_string(),
        }
    }
}
