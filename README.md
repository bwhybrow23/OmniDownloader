# OmniDownloader
Omni - all
Downloader - a program that downloads content from the internet

Originally created as CoomerManager, this application was intended to be a manager solely for the [Coomer](https://coomer.su) website. However, I've decided to expand its functionality to be able to download content from more than just the Coomer platform. 

In a nutshell, it's a content downloader that you can also periodically run and, using a duplicate checker, will download any new content from the creators you've added to the watchlist.

**OmniDownloader is compatible with any platform that supports NodeJS.** It has been tested on Windows 11 and Ubuntu 22.04.

## 📦 Installation
1. Clone the repository
```bash
git clone https://github.com/bwhybrow23/OmniDownloader.git
```
2. Install the required packages
```bash
npm ci
```
3. Edit the config.json file to your liking:
```json
{
  "BASE_DIR": "downloads", # The base directory where all the content will be stored
  "LOG_DIR": "logs", # The directory where the logs will be stored
  "separate_folders": true, # Whether to store the content in separate folders or not
  "image_folder": "Images", # The folder where the images will be stored
  "video_folder": "Videos" # The folder where the videos will be stored
}
```

## 📜 License
OmniDownloader is licensed under the MIT License. See [LICENSE](LICENSE) for more information.