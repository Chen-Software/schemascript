use anyhow::Result;
use artefact_runtime::chat::ChatManager;
use artefact_runtime::onnx_engine::OnnxEngine;
use artefact_runtime::JsHost;
use artefact_runtime::{AsyncDatabase, QueryPayload};
use rquickjs::{Context, Function, Object, Runtime};
use std::sync::Arc;

fn main() -> Result<()> {
    smol::block_on(async {
        // Use async database initialization with connection pooling
        let db = AsyncDatabase::new("artefact.db").await?;
        let db = Arc::new(db);

        // Initialize ONNX engine and Chat manager
        // We use a mock-ready approach here because actual models might be missing in the environment.
        let engine_res = OnnxEngine::new();
        let chat = match engine_res {
            Ok(engine) => Arc::new(ChatManager::new(Arc::new(engine), db.clone())),
            Err(e) => {
                eprintln!("Warning: ONNX Engine failed to initialize (models probably missing): {}", e);
                // Fallback or exit? For now, we continue but chat calls will fail if we don't mock them.
                // In a real production app, we would trigger a model download.
                return Ok(());
            }
        };

        let host = JsHost::new(db, chat)?;

        println!("Artefact Runtime started. (ONNX and Chat APIs ready)");

        // Example JS code execution via JsHost
        host.eval::<()>(r#"
            console.log("Starting Artefact Sandbox...");
            
            try {
                const response = chat.sendMessage("Hello, how are you?");
                console.log("AI Response: " + response);

                const sessionResponse = chat.sendMessage("What did I just say?", "session-1");
                console.log("AI Session Response: " + sessionResponse);
            } catch (e) {
                console.log("Chat Error (Expected if models missing): " + e);
            }
        "#)?;

        Ok(())
    })
}
