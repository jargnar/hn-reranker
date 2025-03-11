# Hacker News Personalized Ranking

This Next.js application fetches the top 500 stories from Hacker News and ranks them based on relevance to your interests.

## Features

- Fetches the top 500 stories from Hacker News API
- Analyzes user-provided bio/interests
- Ranks stories based on relevance to user interests
- Responsive UI for both desktop and mobile

## How It Works

1. The application uses natural language processing techniques to analyze your bio
2. It extracts keywords and important terms from your interests
3. Each Hacker News story is scored based on similarity to your interests
4. Stories are ranked and displayed in order of relevance

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hn-reranker
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter your bio, interests, and background in the text area
2. Click "Rank Stories" to submit
3. Wait for the application to fetch and rank stories (this may take a moment)
4. Browse through the personalized list of Hacker News stories

## Technologies Used

- Next.js 15
- React 19
- Tailwind CSS
- Natural.js for text processing
- Axios for API requests

## API Endpoints

- `POST /api/rank-stories` - Accepts a user bio and returns ranked Hacker News stories

## License

This project is open source and available under the MIT License.
