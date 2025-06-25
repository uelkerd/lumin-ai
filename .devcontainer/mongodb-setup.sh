#!/bin/bash

# LUMIN.AI MongoDB Setup Script
# Configures MongoDB for optimal multimodal governance analysis performance
# Complements the JavaScript initialization script

set -e

echo "🍃 Configuring MongoDB for LUMIN.AI democratic governance analysis..."

# Wait for MongoDB to be fully ready
echo "Waiting for MongoDB to be ready..."
until mongosh --eval "print('MongoDB is ready')" --connectTimeoutMS 5000 > /dev/null 2>&1; do
  echo "Waiting for MongoDB..."
  sleep 2
done

echo "✅ MongoDB is ready. Starting configuration..."

# Configure MongoDB for optimal performance with governance data
mongosh --eval "
// Enable profiling for query optimization
db.setProfilingLevel(1, { slowms: 100 });

// Configure storage engine options for better text search performance
db.adminCommand({
  setParameter: 1,
  textSearchEnabled: true
});

// Set up optimal read preferences for analytics workloads
db.adminCommand({
  setParameter: 1,
  maxIndexBuildMemoryUsageMB: 500
});

print('📊 MongoDB performance optimizations applied');
"

# Create additional indexes for complex governance analysis queries
mongosh governance_analysis --eval "
// Compound indexes for cross-track analysis
db.democracy_radar_responses.createIndex({
  'demographics.region': 1,
  'wave': 1,
  'responses.trust_government': -1,
  'survey_year': -1
}, { background: true, name: 'region_wave_trust_year_idx' });

// Geospatial index preparation (for future geographic analysis)
db.governance_documents.createIndex({
  'document_metadata.geographic_scope': '2dsphere'
}, { background: true, sparse: true });

// Full-text search optimization for multilingual content
db.governance_documents.createIndex({
  'content.text': 'text',
  'title': 'text',
  'document_metadata.source_organization': 'text'
}, {
  weights: {
    'title': 10,
    'content.text': 5,
    'document_metadata.source_organization': 1
  },
  default_language: 'german',
  language_override: 'content.language',
  background: true,
  name: 'governance_fulltext_idx'
});

// Time-series optimized index for trend analysis
db.governance_metrics.createIndex({
  'metric_type': 1,
  'time_period.start_date': -1,
  'geographic_scope.country': 1
}, { background: true, name: 'metrics_timeseries_idx' });

// Multimodal content indexes for efficient media queries
db.governance_documents.createIndex({
  'multimodal_content.has_images': 1,
  'processing_status.image_analyzed': 1
}, { background: true, sparse: true });

db.governance_documents.createIndex({
  'multimodal_content.has_audio': 1,
  'processing_status.audio_transcribed': 1
}, { background: true, sparse: true });

// ML model results optimization
db.ml_model_results.createIndex({
  'model_metadata.model_name': 1,
  'model_metadata.model_version': 1,
  'training_metrics.accuracy': -1
}, { background: true, name: 'model_performance_idx' });

// Blockchain governance analysis indexes
db.blockchain_governance.createIndex({
  'blockchain_platform': 1,
  'voting_data.total_votes': -1,
  'governance_data.proposal_type': 1
}, { background: true, name: 'blockchain_voting_idx' });

print('🔍 Advanced indexes created for multimodal governance analysis');
"

# Set up MongoDB aggregation pipeline optimization
mongosh governance_analysis --eval "
// Create pre-computed views for dashboard performance
db.createView('regional_trust_dashboard', 'democracy_radar_responses', [
  {
    \$match: {
      'responses.trust_government': { \$exists: true, \$ne: null }
    }
  },
  {
    \$group: {
      _id: {
        region: '\$demographics.region',
        year: '\$survey_year',
        wave: '\$wave'
      },
      avg_trust_government: { \$avg: '\$responses.trust_government' },
      avg_trust_parliament: { \$avg: '\$responses.trust_parliament' },
      avg_democratic_satisfaction: { \$avg: '\$responses.democratic_satisfaction' },
      respondent_count: { \$sum: 1 },
      confidence_interval: {
        \$stdDevPop: '\$responses.trust_government'
      }
    }
  },
  {
    \$addFields: {
      trust_composite: {
        \$avg: ['\$avg_trust_government', '\$avg_trust_parliament']
      },
      data_quality_score: {
        \$cond: {
          if: { \$gte: ['\$respondent_count', 50] },
          then: 1.0,
          else: { \$divide: ['\$respondent_count', 50] }
        }
      }
    }
  },
  {
    \$sort: { '_id.year': -1, '_id.wave': -1, '_id.region': 1 }
  }
]);

// Sentiment trends view for cross-track integration
db.createView('sentiment_trends_dashboard', 'governance_documents', [
  {
    \$match: {
      'ml_analysis.sentiment_scores.confidence': { \$gte: 0.7 },
      'document_metadata.publication_date': {
        \$gte: new Date('2022-01-01')
      }
    }
  },
  {
    \$group: {
      _id: {
        year: { \$year: '\$document_metadata.publication_date' },
        month: { \$month: '\$document_metadata.publication_date' },
        document_type: '\$document_metadata.document_type'
      },
      avg_positive_sentiment: { \$avg: '\$ml_analysis.sentiment_scores.positive' },
      avg_negative_sentiment: { \$avg: '\$ml_analysis.sentiment_scores.negative' },
      document_count: { \$sum: 1 },
      total_engagement: { \$sum: '\$engagement_metrics.view_count' }
    }
  },
  {
    \$sort: { '_id.year': -1, '_id.month': -1 }
  }
]);

// Multimodal content overview
db.createView('multimodal_content_stats', 'governance_documents', [
  {
    \$group: {
      _id: '\$document_metadata.document_type',
      total_documents: { \$sum: 1 },
      documents_with_images: {
        \$sum: { \$cond: ['\$multimodal_content.has_images', 1, 0] }
      },
      documents_with_audio: {
        \$sum: { \$cond: ['\$multimodal_content.has_audio', 1, 0] }
      },
      documents_with_video: {
        \$sum: { \$cond: ['\$multimodal_content.has_video', 1, 0] }
      },
      avg_engagement: { \$avg: '\$engagement_metrics.view_count' }
    }
  },
  {
    \$addFields: {
      multimedia_percentage: {
        \$multiply: [
          {
            \$divide: [
              {
                \$add: [
                  '\$documents_with_images',
                  '\$documents_with_audio',
                  '\$documents_with_video'
                ]
              },
              { \$multiply: ['\$total_documents', 3] }
            ]
          },
          100
        ]
      }
    }
  }
]);

print('📈 Dashboard optimization views created');
"

# Configure GridFS for large file storage
mongosh governance_analysis --eval "
// Initialize GridFS collections with appropriate indexes
db.fs.files.createIndex({ 'filename': 1, 'uploadDate': -1 });
db.fs.chunks.createIndex({ 'files_id': 1, 'n': 1 }, { unique: true });

// Create custom GridFS bucket for governance files
use governance_analysis;
db.createCollection('governance_files.files');
db.createCollection('governance_files.chunks');

db.governance_files.files.createIndex({ 'filename': 1, 'uploadDate': -1 });
db.governance_files.chunks.createIndex({ 'files_id': 1, 'n': 1 }, { unique: true });

print('📁 GridFS configured for multimodal file storage');
"

# Set up change streams for real-time analysis
mongosh governance_analysis --eval "
// Enable change streams on key collections for real-time updates
// This supports real-time dashboard updates and ML pipeline triggers

// Configure optimal settings for change streams
db.adminCommand({
  setParameter: 1,
  changeStreamPreAndPostImagesCollectionTTLSecondsOld: 3600,
  changeStreamPreAndPostImagesCollectionTTLSecondsNew: 3600
});

print('🔄 Change streams configured for real-time governance analysis');
"

# Create database statistics collection for monitoring
mongosh governance_analysis --eval "
 // Create monitoring collection for database health
db.createCollection('system_monitoring');

// Create indexes for efficient queries as the collection grows
db.system_monitoring.createIndex({ setup_date: 1 });
db.system_monitoring.createIndex({ version: 1 });

// Insert initial monitoring document
db.system_monitoring.insertOne({
  setup_date: new Date(),
  version: '1.0.0',
  collections: [
    'democracy_radar_responses',
    'governance_documents',
    'ml_model_results',
    'governance_metrics',
    'blockchain_governance',
    'user_interactions',
    'api_cache'
  ],
  optimization_status: {
    indexes_created: true,
    views_created: true,
    gridfs_configured: true,
    change_streams_enabled: true
  },
  performance_targets: {
    query_response_time_ms: 100,
    aggregation_response_time_ms: 500,
    concurrent_users: 50
  }
});

print('📊 System monitoring configured');
"

# Set up data validation rules for data quality
mongosh governance_analysis --eval "
// Add validation rules for data quality assurance
db.runCommand({
  collMod: 'democracy_radar_responses',
  validator: {
    \$jsonSchema: {
      bsonType: 'object',
      required: ['respondent_id', 'wave', 'survey_year', 'responses'],
      properties: {
        respondent_id: { bsonType: 'int', minimum: 1 },
        wave: { bsonType: 'int', minimum: 1, maximum: 20 },
        survey_year: { bsonType: 'int', minimum: 2018, maximum: 2030 },
        responses: {
          bsonType: 'object',
          properties: {
            trust_government: { bsonType: ['int', 'double'], minimum: 0, maximum: 10 },
            trust_parliament: { bsonType: ['int', 'double'], minimum: 0, maximum: 10 },
            democratic_satisfaction: { bsonType: ['int', 'double'], minimum: 0, maximum: 10 }
          }
        }
      }
    }
  },
  validationLevel: 'moderate',
  validationAction: 'warn'
});

db.runCommand({
  collMod: 'governance_documents',
  validator: {
    \$jsonSchema: {
      bsonType: 'object',
      required: ['document_id', 'content', 'document_metadata'],
      properties: {
        document_id: { bsonType: 'string', pattern: '^(GOV|DOC)_[A-Za-z0-9]+\$' },
        'content.text': { bsonType: 'string', minLength: 10 },
        'document_metadata.publication_date': { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'moderate',
  validationAction: 'warn'
});

print('✅ Data validation rules applied for quality assurance');
"

echo "🎉 MongoDB setup completed successfully!"
echo ""
echo "Configuration summary:"
echo "  ✅ Performance optimizations applied"
echo "  ✅ Advanced indexes created for multimodal analysis"
echo "  ✅ Dashboard optimization views configured"
echo "  ✅ GridFS configured for large file storage"
echo "  ✅ Change streams enabled for real-time updates"
echo "  ✅ Data validation rules applied"
echo "  ✅ System monitoring configured"
echo ""
echo "MongoDB is now optimized for democratic governance analysis!"
echo "Ready for multimodal data: text, images, audio, video, and complex ML outputs"
