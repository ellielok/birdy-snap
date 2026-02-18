# Birdy Shot

An AWS-powered serverless media storage system with advanced bird tagging capabilities.

## About

Birdy Shot is a cloud-based platform designed for bird enthusiasts, researchers, and nature photographers. Users can upload bird images and videos, which are automatically tagged with detected bird species using a pretrained deep learning model. Files can then be searched and retrieved based on these tags.

The project was originally built as a university group project (FIT5225) and is now being rebuilt on AWS with a modernized frontend. **The platform is currently in early access — only core search features are available. More features (authentication, file upload, tag notifications, etc.) will be rolled out as the backend is progressively rebuilt.**

## Features

### Currently Available

- **Reverse Image Search** — Upload a bird photo to find visually similar images in the database. The system detects bird species in your uploaded image and returns all matching files with the same tags.
- **Text Search** — Search for files by bird species tags. Supports simple tag queries (e.g. `crow`) and tag-with-count queries (e.g. `crow:3,pigeon:1`) to find images containing specific numbers of each species.
- **About Page** — Learn more about the project and its background.

### Coming Soon

These features were part of the original system and will be re-enabled as the AWS backend is rebuilt:

- **User Authentication** — Sign up and login via AWS Cognito, with protected routes and session management.
- **File Upload** — Upload bird images and videos to S3. Upon upload, a Lambda function automatically detects bird species and generates tags and thumbnails.
- **Tag Subscription & Notifications** — Subscribe to specific bird tags and receive email notifications (via AWS SNS) when new matching files are added.
- **Manual Tag Management** — Add or remove tags from files with bulk tagging support.
- **File Deletion** — Remove files and their thumbnails from S3 and the database.

## Tech Stack

**Frontend**
- Vue 3 (Composition API)
- Tailwind CSS v4
- Element Plus
- Vue Router
- Axios

**Backend (AWS)**
- Amazon S3 — File & thumbnail storage
- AWS Lambda — Auto-tagging with pretrained bird detection model, thumbnail generation
- API Gateway — RESTful API endpoints
- DynamoDB — Tag and file metadata storage
- Amazon Cognito — Authentication & authorization
- Amazon SNS — Tag-based email notifications

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npx vite build
```

## License

This project is for educational and personal use.
