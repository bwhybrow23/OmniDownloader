# Database Schema

## 1. Profiles Table (`profiles`)
This table will store information about the profiles being tracked (watchlist)
| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id          | INTEGER   | Primary key, auto-incrementing ID for each user. |
| platform    | TEXT      | The platform name (e.g., "onlyfans"). |
| user_id     | TEXT      | The unique ID for the user on the platform. |
| username    | TEXT      | The display name of the user. |
| media_type  | TEXT      | Type of media to monitor (e.g., "videos", "images"). |

## 2. Posts Table (`posts`)
This table will store individual posts made by the profiles being tracked
| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id          | INTEGER   | Primary key, auto-incrementing ID for each post. |
| profile_id  | INTEGER   | Foreign key to the `profiles` table. |
| post_id     | TEXT      | The unique ID for the post on the platform. |
| title       | TEXT      | The title of the post. |
| content     | TEXT      | The content of the post. |

## 3. Files Table (`files`)
This table will store information about the files attached to each post
| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id          | INTEGER   | Primary key, auto-incrementing ID for each file. |
| post_id     | INTEGER   | Foreign key to the `posts` table. |
| file_name   | TEXT      | The name of the file. |
| file_path   | TEXT      | The path to the file on disk. |