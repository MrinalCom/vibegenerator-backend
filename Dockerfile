# Use official Playwright image (includes all browser dependencies)
FROM mcr.microsoft.com/playwright:focal

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN npm install

# Install Playwright browsers with all system dependencies
RUN npx playwright install --with-deps

# Expose port (adjust if you use a different one)
EXPOSE 5000

# Start your server (change if your entry file is different)
CMD ["node", "index.js"]
