// LUMIN.AI MongoDB Initialization Script
// Sets up MongoDB collections and indexes for democratic governance analysis
// Supports multimodal data: text, images, audio, structured survey data, ML embeddings

print('LUMIN.AI: Starting MongoDB initialization...');
print('LUMIN.AI: Reading database configuration from environment variables');

// Get MongoDB configuration from environment variables
const username = process.env.MONGO_USERNAME || 'lumin';
const password = process.env.MONGO_PASSWORD || 'devpassword';  // pragma: allowlist secret
const dbName = process.env.MONGO_DB_NAME || 'governance_analysis';

try {
  // Create database if it doesn't exist
  db = db.getSiblingDB(dbName);

  // Create user for application access if it doesn't already exist
  const existingUser = db.getUser(username);
  if (!existingUser) {
    print(`LUMIN.AI: Creating new MongoDB user '${username}' for database '${dbName}'`);
    db.createUser({
      user: username,
      pwd: password,
      roles: [
        { role: 'readWrite', db: dbName },
        { role: 'dbAdmin', db: dbName }
      ]
    });
    print('LUMIN.AI: MongoDB user created successfully');
  } else {
    print(`LUMIN.AI: MongoDB user '${username}' already exists, skipping creation`);
  }
} catch (error) {
  print('LUMIN.AI: Error during MongoDB initialization: ' + error.message);
  throw error;
}

print('LUMIN.AI: Setting up MongoDB collections for democratic governance analysis...');

// ===== DEMOCRACY RADAR COLLECTION =====
// Flexible schema for Austria Democracy Radar survey data
// Supports varying survey structures across waves and additional metadata
db.createCollection('democracy_radar_responses');

// Sample Democracy Radar documents with flexible schema
db.democracy_radar_responses.insertMany([
  {
    _id: ObjectId(),
    respondent_id: 1,
    wave: 1,
    survey_year: 2018,
    responses: {
      trust_government: 6,
      trust_parliament: 5,
      trust_political_parties: 4,
      trust_media: 5,
      democratic_satisfaction: 7,
      political_efficacy: 6,
      civic_engagement_level: 5
    },
    demographics: {
      age_group: '25-34',
      education_level: 'University',
      region: 'Vienna',
      urban_rural: 'urban',
      income_bracket: 'middle',
      employment_status: 'employed'
    },
    metadata: {
      data_source: 'austria_democracy_radar',
      collection_method: 'online_survey',
      survey_language: 'de',
      completion_time_minutes: 15,
      data_quality_score: 0.95
    },
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    respondent_id: 2,
    wave: 1,
    survey_year: 2018,
    responses: {
      trust_government: 4,
      trust_parliament: 3,
      trust_political_parties: 2,
      trust_media: 3,
      democratic_satisfaction: 5,
      political_efficacy: 4,
      civic_engagement_level: 3
    },
    demographics: {
      age_group: '35-44',
      education_level: 'Secondary',
      region: 'Salzburg',
      urban_rural: 'rural',
      income_bracket: 'lower_middle',
      employment_status: 'employed'
    },
    metadata: {
      data_source: 'austria_democracy_radar',
      collection_method: 'phone_survey',
      survey_language: 'de',
      completion_time_minutes: 22,
      data_quality_score: 0.88
    },
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// Create indexes for efficient querying
db.democracy_radar_responses.createIndex({ "wave": 1, "survey_year": 1 });
db.democracy_radar_responses.createIndex({ "demographics.region": 1 });
db.democracy_radar_responses.createIndex({ "respondent_id": 1, "wave": 1 }, { unique: true });
db.democracy_radar_responses.createIndex({ "responses.trust_government": 1 });
db.democracy_radar_responses.createIndex({ "created_at": 1 });

// ===== GOVERNANCE DOCUMENTS COLLECTION =====
// Multimodal document storage for governance texts, images, audio, video
// Supports flexible document types and embedded ML analysis results
db.createCollection('governance_documents');

// Sample governance documents with multimodal capabilities
db.governance_documents.insertMany([
  {
    _id: ObjectId(),
    document_id: 'GOV_001',
    title: 'Budget Transparency Initiative',
    content: {
      text: 'The new budget transparency measures will enhance democratic accountability and citizen trust in government financial decisions. These measures include public dashboards, citizen participation forums, and regular transparency reports.',
      language: 'de',
      word_count: 156,
      character_count: 892,
      readability_score: 7.2
    },
    multimodal_content: {
      has_images: true,
      image_urls: ['https://example.gov.at/budget_infographic.png'],
      has_audio: false,
      has_video: false,
      pdf_url: 'https://example.gov.at/budget_transparency_2023.pdf'
    },
    document_metadata: {
      document_type: 'policy_document',
      source_organization: 'Austrian Federal Ministry of Finance',
      author: 'Ministry of Finance Communications Team',
      publication_date: new Date('2023-01-15'),
      classification: 'public',
      legal_status: 'official_policy',
      related_laws: ['Transparency Act 2022', 'Budget Law 2023']
    },
    processing_status: {
      text_processed: true,
      sentiment_analyzed: true,
      topic_modeled: false,
      entity_extraction: true,
      image_analyzed: false
    },
    ml_analysis: {
      sentiment_scores: {
        positive: 0.85,
        negative: 0.10,
        neutral: 0.05,
        confidence: 0.92,
        model_version: 'governance-sentiment-v1.2'
      },
      named_entities: [
        { text: 'Budget Transparency Initiative', label: 'POLICY', confidence: 0.95 },
        { text: 'Austrian Federal Ministry', label: 'ORG', confidence: 0.98 }
      ],
      topic_categories: ['budget', 'transparency', 'accountability'],
      embeddings: {
        sentence_transformer: [/* 384-dimensional vector would go here */],
        model_name: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
      }
    },
    engagement_metrics: {
      view_count: 1250,
      download_count: 89,
      social_shares: 34,
      public_comments: 12
    },
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    document_id: 'GOV_002',
    title: 'Digital Participation Platform Launch',
    content: {
      text: 'Citizens can now participate directly in policy discussions through our new digital democracy platform, strengthening democratic engagement and ensuring diverse voices are heard in governance decisions.',
      language: 'de',
      word_count: 134,
      character_count: 756,
      readability_score: 6.8
    },
    multimodal_content: {
      has_images: true,
      image_urls: ['https://example.vienna.gv.at/platform_screenshot.png'],
      has_audio: true,
      audio_urls: ['https://example.vienna.gv.at/announcement.mp3'],
      has_video: true,
      video_urls: ['https://example.vienna.gv.at/platform_demo.mp4']
    },
    document_metadata: {
      document_type: 'announcement',
      source_organization: 'Municipal Government Vienna',
      author: 'Digital Innovation Team',
      publication_date: new Date('2023-02-20'),
      classification: 'public',
      legal_status: 'informational',
      target_audience: ['citizens', 'civil_society', 'researchers']
    },
    processing_status: {
      text_processed: true,
      sentiment_analyzed: true,
      topic_modeled: true,
      entity_extraction: true,
      image_analyzed: true,
      audio_transcribed: true,
      video_analyzed: false
    },
    ml_analysis: {
      sentiment_scores: {
        positive: 0.92,
        negative: 0.05,
        neutral: 0.03,
        confidence: 0.89,
        model_version: 'governance-sentiment-v1.2'
      },
      audio_transcription: {
        text: 'Welcome to our new digital participation platform...',
        confidence: 0.94,
        language_detected: 'de',
        speaker_count: 2
      },
      image_analysis: {
        objects_detected: ['computer_screen', 'interface', 'charts'],
        text_in_images: ['Digital Participation', 'Bürgerbeteiligung'],
        accessibility_score: 0.87
      }
    },
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// Create indexes for governance documents
db.governance_documents.createIndex({ "document_id": 1 }, { unique: true });
db.governance_documents.createIndex({ "document_metadata.document_type": 1 });
db.governance_documents.createIndex({ "document_metadata.publication_date": -1 });
db.governance_documents.createIndex({ "content.text": "text" }); // Full-text search
db.governance_documents.createIndex({ "ml_analysis.sentiment_scores.positive": -1 });
db.governance_documents.createIndex({ "processing_status.sentiment_analyzed": 1 });
db.governance_documents.createIndex({ "multimodal_content.has_images": 1 });

// ===== ML MODEL RESULTS COLLECTION =====
// Stores outputs from Deep Learning models: embeddings, predictions, training metrics
// Supports model versioning and experiment tracking
db.createCollection('ml_model_results');

// Sample ML model results with flexible schema for different model types
db.ml_model_results.insertMany([
  {
    _id: ObjectId(),
    model_run_id: 'sentiment_run_001',
    model_metadata: {
      model_name: 'governance_sentiment_transformer',
      model_version: '1.2.0',
      model_type: 'sentiment_analysis',
      framework: 'transformers',
      base_model: 'bert-base-german-cased',
      training_date: new Date('2023-01-10'),
      parameters: {
        learning_rate: 2e-5,
        batch_size: 16,
        epochs: 3,
        max_length: 512
      }
    },
    training_metrics: {
      accuracy: 0.94,
      precision: 0.92,
      recall: 0.91,
      f1_score: 0.915,
      loss: 0.156,
      validation_loss: 0.189,
      training_time_hours: 4.5
    },
    predictions: [
      {
        document_id: 'GOV_001',
        input_text: 'Budget transparency measures...',
        predictions: {
          sentiment_label: 'positive',
          confidence_scores: { positive: 0.85, negative: 0.10, neutral: 0.05 },
          embedding: [/* 768-dimensional vector */],
          attention_weights: [/* attention visualization data */]
        }
      }
    ],
    experiment_config: {
      experiment_name: 'governance_sentiment_v1',
      hyperparameters: {
        dropout_rate: 0.1,
        weight_decay: 0.01,
        warmup_steps: 500
      },
      data_split: {
        train_size: 0.8,
        validation_size: 0.1,
        test_size: 0.1
      }
    },
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// Create indexes for ML results
db.ml_model_results.createIndex({ "model_run_id": 1 }, { unique: true });
db.ml_model_results.createIndex({ "model_metadata.model_name": 1, "model_metadata.model_version": 1 });
db.ml_model_results.createIndex({ "training_metrics.accuracy": -1 });
db.ml_model_results.createIndex({ "created_at": -1 });

// ===== GOVERNANCE METRICS COLLECTION =====
// Aggregated metrics for dashboard visualization
// Supports real-time analytics and trend analysis
db.createCollection('governance_metrics');

// Sample aggregated metrics
db.governance_metrics.insertMany([
  {
    _id: ObjectId(),
    metric_id: 'trust_trends_2023_Q1',
    metric_type: 'trust_analysis',
    time_period: {
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-03-31'),
      granularity: 'quarterly'
    },
    geographic_scope: {
      country: 'Austria',
      regions: ['Vienna', 'Salzburg', 'Innsbruck'],
      analysis_level: 'regional'
    },
    metrics: {
      avg_trust_government: 5.4,
      avg_trust_parliament: 4.8,
      avg_democratic_satisfaction: 6.1,
      sentiment_score: 0.72,
      participation_rate: 0.34
    },
    confidence_intervals: {
      trust_government: { lower: 5.1, upper: 5.7 },
      trust_parliament: { lower: 4.5, upper: 5.1 },
      democratic_satisfaction: { lower: 5.8, upper: 6.4 }
    },
    sample_statistics: {
      total_responses: 1247,
      response_rate: 0.23,
      demographic_breakdown: {
        age_groups: { '18-29': 0.15, '30-44': 0.35, '45-64': 0.35, '65+': 0.15 },
        education_levels: { 'basic': 0.20, 'secondary': 0.45, 'university': 0.35 }
      }
    },
    trend_analysis: {
      direction: 'increasing',
      magnitude: 0.3,
      significance: 0.02,
      seasonal_effects: false
    },
    calculation_metadata: {
      method: 'weighted_average',
      weights: 'population_proportional',
      missing_data_handling: 'listwise_deletion',
      calculation_date: new Date()
    },
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// Create indexes for governance metrics
db.governance_metrics.createIndex({ "metric_id": 1 }, { unique: true });
db.governance_metrics.createIndex({ "metric_type": 1, "time_period.start_date": -1 });
db.governance_metrics.createIndex({ "geographic_scope.regions": 1 });
db.governance_metrics.createIndex({ "metrics.avg_trust_government": -1 });

// ===== API CACHE COLLECTION =====
// Caches API responses for improved performance
// Supports TTL (Time To Live) for automatic cleanup
db.createCollection('api_cache');

// Create TTL index for automatic cache expiration (expires after 1 hour)
db.api_cache.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 });
db.api_cache.createIndex({ "cache_key": 1 }, { unique: true });
db.api_cache.createIndex({ "endpoint": 1 });

// Sample cache entries
db.api_cache.insertMany([
  {
    _id: ObjectId(),
    cache_key: 'sentiment_analysis_gov_001',
    endpoint: '/api/analyze/sentiment',
    request_parameters: {
      document_id: 'GOV_001',
      model_version: '1.2.0'
    },
    response_data: {
      sentiment_label: 'positive',
      confidence: 0.85,
      processing_time_ms: 245
    },
    metadata: {
      computation_time_ms: 245,
      model_version: 'governance-sentiment-v1.2',
      cache_hit_count: 0
    },
    created_at: new Date(),
    expires_at: new Date(Date.now() + 3600000) // Expires in 1 hour
  }
]);

// ===== USER INTERACTIONS COLLECTION =====
// Tracks user interactions with governance platform
// Supports UX analysis and user behavior insights
db.createCollection('user_interactions');

db.user_interactions.insertMany([
  {
    _id: ObjectId(),
    session_id: 'session_12345',
    user_metadata: {
      user_type: 'citizen',
      region: 'Vienna',
      anonymized_id: 'user_abc123'
    },
    interaction_data: {
      action: 'document_view',
      document_id: 'GOV_001',
      time_spent_seconds: 120,
      scroll_depth: 0.75,
      interaction_quality: 'engaged'
    },
    context: {
      device_type: 'desktop',
      browser: 'chrome',
      screen_resolution: '1920x1080',
      referrer_source: 'google_search'
    },
    timestamp: new Date(),
    created_at: new Date()
  }
]);

// Create indexes for user interactions
db.user_interactions.createIndex({ "session_id": 1 });
db.user_interactions.createIndex({ "interaction_data.action": 1, "timestamp": -1 });
db.user_interactions.createIndex({ "user_metadata.region": 1 });

// ===== BLOCKCHAIN GOVERNANCE DATA COLLECTION =====
// Stores blockchain governance data with flexible schema
// Supports various blockchain platforms and governance mechanisms
db.createCollection('blockchain_governance');

db.blockchain_governance.insertMany([
  {
    _id: ObjectId(),
    proposal_id: 'PROP_001',
    blockchain_platform: 'ethereum',
    governance_data: {
      proposal_title: 'Upgrade Democratic Voting Contract',
      proposal_description: 'Implement quadratic voting mechanism for enhanced democratic representation',
      proposal_type: 'technical_upgrade',
      voting_mechanism: 'quadratic_voting'
    },
    voting_data: {
      total_votes: 15420,
      votes_for: 12336,
      votes_against: 3084,
      voting_power_distribution: {
        'whale_voters': 0.05,
        'regular_voters': 0.85,
        'small_voters': 0.10
      },
      vote_timeline: [
        { timestamp: new Date('2023-01-15'), cumulative_votes: 1000 },
        { timestamp: new Date('2023-01-16'), cumulative_votes: 5000 },
        { timestamp: new Date('2023-01-17'), cumulative_votes: 15420 }
      ]
    },
    sentiment_analysis: {
      proposal_sentiment: 0.78,
      comment_sentiment_distribution: {
        positive: 0.65,
        neutral: 0.25,
        negative: 0.10
      },
      sentiment_evolution: [
        { date: new Date('2023-01-15'), sentiment: 0.60 },
        { date: new Date('2023-01-16'), sentiment: 0.72 },
        { date: new Date('2023-01-17'), sentiment: 0.78 }
      ]
    },
    network_analysis: {
      voting_clusters: ['technical_experts', 'token_holders', 'community_members'],
      influence_scores: {
        'technical_experts': 0.45,
        'token_holders': 0.35,
        'community_members': 0.20
      }
    },
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// Create indexes for blockchain governance
db.blockchain_governance.createIndex({ "proposal_id": 1 }, { unique: true });
db.blockchain_governance.createIndex({ "blockchain_platform": 1 });
db.blockchain_governance.createIndex({ "governance_data.proposal_type": 1 });
db.blockchain_governance.createIndex({ "voting_data.total_votes": -1 });

// ===== CREATE VIEWS (MongoDB Aggregation Pipelines) =====
// MongoDB equivalent of SQL views using saved aggregation pipelines

// Trust trends by region view
db.createView('trust_by_region', 'democracy_radar_responses', [
  {
    $group: {
      _id: {
        region: '$demographics.region',
        wave: '$wave',
        survey_year: '$survey_year'
      },
      respondent_count: { $sum: 1 },
      avg_trust_government: { $avg: '$responses.trust_government' },
      avg_trust_parliament: { $avg: '$responses.trust_parliament' },
      avg_democratic_satisfaction: { $avg: '$responses.democratic_satisfaction' },
      std_trust_government: { $stdDevPop: '$responses.trust_government' }
    }
  },
  {
    $sort: { '_id.survey_year': 1, '_id.wave': 1, '_id.region': 1 }
  }
]);

// Document sentiment summary view
db.createView('document_sentiment_summary', 'governance_documents', [
  {
    $match: { 'ml_analysis.sentiment_scores.confidence': { $gte: 0.7 } }
  },
  {
    $project: {
      document_id: 1,
      title: 1,
      'document_metadata.document_type': 1,
      'document_metadata.source_organization': 1,
      'document_metadata.publication_date': 1,
      'ml_analysis.sentiment_scores': 1,
      'engagement_metrics': 1
    }
  },
  {
    $sort: { 'document_metadata.publication_date': -1 }
  }
]);

// Set up MongoDB monitoring and optimization
db.runCommand({
  collMod: 'governance_documents',
  index: {
    keyPattern: { 'content.text': 'text' },
    weights: {
      'content.text': 10,
      'title': 5,
      'document_metadata.source_organization': 1
    },
    default_language: 'german'
  }
});

// Create compound indexes for complex queries
db.democracy_radar_responses.createIndex({
  'wave': 1,
  'demographics.region': 1,
  'responses.trust_government': -1
});

db.governance_documents.createIndex({
  'document_metadata.publication_date': -1,
  'ml_analysis.sentiment_scores.positive': -1,
  'processing_status.sentiment_analyzed': 1
});

// Enable sharding preparation (for future scalability)
db.adminCommand({ enableSharding: 'governance_analysis' });

print('✅ LUMIN.AI MongoDB setup completed successfully!');
print('📊 Collections created:');
print('   - democracy_radar_responses (flexible survey data)');
print('   - governance_documents (multimodal document storage)');
print('   - ml_model_results (Deep Learning outputs)');
print('   - governance_metrics (aggregated analytics)');
print('   - blockchain_governance (blockchain governance data)');
print('   - user_interactions (UX analytics)');
print('   - api_cache (performance optimization)');
print('🔍 Indexes optimized for governance analysis queries');
print('🎯 Sample data inserted for immediate development start');
print('🚀 Ready for democratic governance analysis across all tracks!');
