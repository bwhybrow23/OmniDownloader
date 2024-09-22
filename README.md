# OmniDownloader
**Omni** - all
**Downloader** - a program that downloads content from the internet

Originally created as CoomerManager, this application was intended to be a manager solely for the [Coomer](https://coomer.su) website. However, I've decided to expand its functionality to be able to download content from more than just the Coomer platform.

In a nutshell, it's a content downloader that you can also periodically run and, using a duplicate checker, will download any new content from the creators you've added to the watchlist.

**OmniDownloader is compatible with any platform that supports NodeJS.** It has been tested on Windows 11 and Ubuntu 22.04.

## 📦 Installation
The installation process is amazingly simple as it can just be ran in a Docker container. If you don't have Docker installed, you can install it from [here](https://docs.docker.com/get-docker/).

This guide assumes that you will store the application data in /srv/OmniDownloader. If you want to store it elsewhere, you will need to change the paths in the `docker-compose.yml` file.
1. Make a directory for the application data:
```bash
sudo mkdir -p /srv/OmniDownloader/Data && sudo mkdir -p /srv/OmniDownloader/downloads
```
2. Make a `docker-compose.yml` file using the below template:
```yml
services:
  omnidownloader:
    image: omnidownloader:latest
    container_name: omnidownloader
    environment:
      - DEBUG=false
      - SEPARATE_FOLDERS=true
      - IMAGE_FOLDER=images
      - VIDEO_FOLDER=videos
    volumes:
      - /srv/OmniDownloader/Data:/srv/OmniDownloader/Data:rw # Configuration files
      - /srv/OmniDownloader/downloads:/srv/OmniDownloader/downloads:rw # Downloaded files
    ports:
      - "6969:6969"
    network_mode: bridge
```
3. Run the following command in the directory where the `docker-compose.yml` file is located:
```bash
sudo docker-compose up -d
```
4. OmniDownloader will now be running on `https://localhost:6969` for you to use!

## 📜 License
OmniDownloader is licensed under the MIT License. See [LICENSE](LICENSE) for more information.