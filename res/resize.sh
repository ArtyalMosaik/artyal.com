#!/bin/bash

read -p "Glisse-dépose l'image ici " input_file

# remove quotes from file path
input_file=$(echo $input_file | sed "s/'//g")

echo "Création des images redimensionnées pour $input_file"

# Create an array of desired widths
sizes=(320 480 640 800 1024 1280 1600 1920 2560 3840)

# Loop through sizes and create resized images
for size in "${sizes[@]}"
do
  output_file="res/main_image/main-${size}.webp"
  magick "$input_file" -resize ${size}x "$output_file"
  echo "Created $output_file"
done

magick "$input_file" res/main_image/main.webp           

echo "Created res/main_image/main.webp"

