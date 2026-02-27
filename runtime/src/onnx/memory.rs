use std::sync::{Arc, Mutex};

pub struct VectorMemory {
    entries: Arc<Mutex<Vec<MemoryEntry>>>,
}

pub struct MemoryEntry {
    pub text: String,
    pub embedding: Vec<f32>,
}

impl VectorMemory {
    pub fn new() -> Self {
        Self {
            entries: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn add(&self, text: String, embedding: Vec<f32>) {
        let mut entries = self.entries.lock().unwrap();
        entries.push(MemoryEntry { text, embedding });
    }

    pub fn search(&self, query_embedding: &[f32], top_k: usize) -> Vec<String> {
        let entries = self.entries.lock().unwrap();
        let mut scores: Vec<(f32, &String)> = entries.iter()
            .map(|e| {
                let score = cosine_similarity(&e.embedding, query_embedding);
                (score, &e.text)
            })
            .collect();

        scores.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
        scores.into_iter().take(top_k).map(|(_, t)| t.clone()).collect()
    }
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() || a.is_empty() {
        return 0.0;
    }
    let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

    if norm_a == 0.0 || norm_b == 0.0 {
        return 0.0;
    }
    dot_product / (norm_a * norm_b)
}
