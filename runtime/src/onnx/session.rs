use std::collections::HashMap;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub role: String,
    pub content: String,
}

pub struct ChatSession {
    pub history: Vec<Message>,
    pub max_history: usize,
}

impl ChatSession {
    pub fn new(max_history: usize) -> Self {
        Self {
            history: Vec::new(),
            max_history,
        }
    }

    pub fn add_message(&mut self, role: &str, content: &str) {
        self.history.push(Message {
            role: role.to_string(),
            content: content.to_string(),
        });

        if self.history.len() > self.max_history {
            self.history.remove(0);
        }
    }

    pub fn get_prompt(&self) -> String {
        self.history.iter()
            .map(|m| format!("{}: {}\n", m.role, m.content))
            .collect::<String>()
    }
}

pub struct SessionManager {
    sessions: HashMap<String, ChatSession>,
    default_session_id: String,
}

impl SessionManager {
    pub fn new() -> Self {
        let mut sessions = HashMap::new();
        let default_id = "default".to_string();
        sessions.insert(default_id.clone(), ChatSession::new(10));

        Self {
            sessions,
            default_session_id: default_id,
        }
    }

    pub fn get_session_mut(&mut self, session_id: Option<String>) -> &mut ChatSession {
        let id = session_id.unwrap_or_else(|| self.default_session_id.clone());
        self.sessions.entry(id).or_insert_with(|| ChatSession::new(10))
    }
}
