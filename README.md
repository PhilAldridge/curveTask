# Spreadsheet Data Ingestion Task

A Node.js application that ingests track data from Excel spreadsheets into MongoDB using Mongoose, with testing using Mocha. The project is containerized with Docker for easy deployment.

## Project Structure

```
├── src/
│   ├── config/
│   │   └── database.js             # Database connection management
│   ├── models/
│   │   ├── Contract.js             # Contract mongoose model
│   │   └── Track.js                # Track mongoose model
│   ├── data/
│   │   └── Track Import Test.xlsx  # Test data for ingestion
│   ├── services/
│   │   ├── trackService.js         # Ingests track data and saves to the database
│   │   ├── spreadsheetReader.js    # Excel file reader
|   |   └── contractService.js      # Performs operations on the contracts collection in the database
│   ├── utils/
│   │   ├── inputProcessing.js      # Common functions for preparing the input to be inserted into the database
│   │   └── trackRowProcessing.js   # Function for converting this specific xlsx file into correct format for the database
│   └── index.js                    # Main application entry point
├── test/
│   ├── setup.js                    # Test configuration and database setup
│   ├── mockDB.js                   # Mock database setup
│   ├── models.test.js              # Model validation tests
│   ├── contractService.test.js     # Contract Service unit tests
│   ├── spreadsheetReader.test.js   # Reader Service unit tests
│   └── trackService.test.js        # Track Service unit tests
├── docker-compose.yml              # Docker services configuration
├── Dockerfile                      # Application container
├── package.json                    # Dependencies and scripts
├── .env                            # Not added to gitignore as this is only a demo app
└── README.md                       # This file
```

## Data Models

### Track Model
- **Title** (required): string
- **Version**: string
- **Artist**: string
- **ISRC** (required): string (processed so that any dashes, spaces or other characters will be stripped out on import)
- **PLine**: string
- **Aliases**: array of strings (processed from semicolon-separated string)
- **ContractId**: Reference to associated contract (where contract name matches an existing contract exactly)

### Contract Model
- **Name** (required, unique): string

## Requirements

- Node.js 18+
- Docker & Docker Compose (for containerized setup)
- OR MongoDB 7.0+ (for local setup)

## Quick Start

1. **Run with Docker:**
   ```bash
   # Build and start services
   docker-compose up --build

   # Stop services
   docker-compose down
   ```

The application will:
- Start MongoDB container
- Create "Contract 1" automatically
- Process your spreadsheet data
- Display detailed results and any errors

2. **Local testing:**
   ```bash
   npm install
   npm run test
   ```

## Data Processing Rules
All entries have whitespace trimmed

### Required Fields
Title and ISRC are required

### Contract Association
1. **Contract exists**: Associates track with found contract
2. **Contract not found**: Returns error for that row
3. **No contract specified**: Saves track without contract association

### Alias Processing
- Aliases are split on semicolon (`;`)
- Empty aliases are filtered out
- Stored as array in database