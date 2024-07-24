#!/bin/bash

read -p "Glisse-dépose l'image ici " input_file

magick_convert=$(command -v magick) || magick_convert=$(command -v convert)

# Check if imagemagick is installed
if ! [ -x "$magick_convert" ]; then
    echo "ImageMagick is not installed. Installing ImageMagick..."
    sudo apt update
    sudo apt install imagemagick
fi

magick_convert=$(command -v magick) || magick_convert=$(command -v convert)

echo "Using $magick_convert"


# remove quotes from file path
input_file=$(echo $input_file | sed "s/'//g")

echo "Creating resized images for $input_file"

# Create an array of desired widths
sizes=(320 480 640 800 1024 1280 1600 1920 2560 3840)

# Loop through sizes and create resized images
for size in "${sizes[@]}"
do
  output_file="res/main_image/main-${size}.webp"
  $magick_convert "$input_file" -resize ${size}x "$output_file"
  echo "Created $output_file"
done

$magick_convert "$input_file" res/main_image/main.webp

echo "Created res/main_image/main.webp"

