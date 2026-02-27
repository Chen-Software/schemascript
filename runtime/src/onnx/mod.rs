pub mod model_manager;
pub mod inference;
pub mod session;
pub mod memory;

use std::sync::{Arc, Mutex};
use self::model_manager::ModelManager;
use self::inference::InferenceEngine;
use self::session::SessionManager;
use self::memory::VectorMemory;

pub struct OnnxSystem {
    pub model_manager: ModelManager,
    pub engine: InferenceEngine,
    pub sessions: Arc<Mutex<SessionManager>>,
    pub memory: Arc<VectorMemory>,
}

impl OnnxSystem {
    pub fn new() -> anyhow::Result<Self> {
        let model_manager = ModelManager::new()?;
        let engine = InferenceEngine::new(&model_manager)?;
        let sessions = Arc::new(Mutex::new(SessionManager::new()));
        let memory = Arc::new(VectorMemory::new());

        Ok(Self {
            model_manager,
            engine,
            sessions,
            memory,
        })
    }

    pub fn chat(&self, message: &str, session_id: Option<String>) -> anyhow::Result<String> {
        let mut sessions = self.sessions.lock().unwrap();
        let session = sessions.get_session_mut(session_id);

        // 1. Add user message
        session.add_message("user", message);

        // 2. Retrieval (Auto-Memory)
        let embedding = self.engine.get_embeddings(message)?;
        let context = self.memory.search(&embedding, 2);

        // 3. Construct augmented prompt (RAG)
        let mut prompt = String::new();
        if !context.is_empty() {
            prompt.push_str("Context from memory:\n");
            for c in context {
                prompt.push_str(&format!("- {}\n", c));
            }
            prompt.push_str("\n");
        }
        prompt.push_str(&session.get_prompt());

        // 4. Generate response
        let response = self.engine.generate(&prompt, 512)?;

        // 5. Add assistant message
        session.add_message("assistant", &response);

        // 6. Asyncly add to memory (Simplified)
        self.memory.add(message.to_string(), embedding);

        Ok(response)
    }
}
