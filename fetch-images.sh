#!/bin/bash

# Freepik API Image Fetcher for Bjelland Entreprenør AS
API_KEY="FPSX16ea10a2ecf0f342b45d9a1ad35dde33"
BASE_DIR="/Users/josuekongolo/Downloads/nettsider/bygg/Gruppe3/Bjelland-entrpenør-as/images"

# Function to search and download image
fetch_image() {
    local search_term="$1"
    local output_path="$2"
    local output_name="$3"

    echo "Searching for: $search_term"

    # URL encode the search term
    encoded_term=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$search_term'))")

    # Search for images
    search_result=$(curl -s -X GET "https://api.freepik.com/v1/resources?locale=en-US&page=1&limit=5&order=relevance&term=${encoded_term}" \
        -H "x-freepik-api-key: $API_KEY" \
        -H "Accept: application/json")

    # Extract first image ID using python for better JSON parsing
    image_id=$(echo "$search_result" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['data'][0]['id'] if data.get('data') else '')" 2>/dev/null)

    if [ -z "$image_id" ]; then
        echo "  No images found for: $search_term"
        return 1
    fi

    echo "  Found image ID: $image_id"

    # Get download URL
    download_result=$(curl -s -X GET "https://api.freepik.com/v1/resources/${image_id}/download" \
        -H "x-freepik-api-key: $API_KEY" \
        -H "Accept: application/json")

    # Extract download URL using python
    download_url=$(echo "$download_result" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('url', ''))" 2>/dev/null)

    if [ -z "$download_url" ]; then
        echo "  Could not get download URL"
        return 1
    fi

    echo "  Downloading to: ${output_path}/${output_name}"

    # Create directory if needed
    mkdir -p "$output_path"

    # Download the image
    curl -s -L "$download_url" -o "${output_path}/${output_name}"

    if [ -f "${output_path}/${output_name}" ] && [ -s "${output_path}/${output_name}" ]; then
        echo "  Downloaded successfully!"
        return 0
    else
        echo "  Download failed"
        return 1
    fi
}

echo "================================================"
echo "Fetching images for Bjelland Entreprenør website"
echo "================================================"
echo ""

# 1. Hero image - excavator at work
echo "[1/10] Hero Image"
fetch_image "excavator construction site" "$BASE_DIR/hero" "hero-excavator.jpg"
echo ""

# 2. Grunnarbeid (Foundation/excavation work)
echo "[2/10] Grunnarbeid (Foundation Work)"
fetch_image "excavation foundation construction" "$BASE_DIR/projects" "grunnarbeid.jpg"
echo ""

# 3. Tomtearbeid (Site preparation)
echo "[3/10] Tomtearbeid (Site Preparation)"
fetch_image "construction site preparation clearing" "$BASE_DIR/projects" "tomtearbeid.jpg"
echo ""

# 4. Drenering (Drainage)
echo "[4/10] Drenering (Drainage)"
fetch_image "drainage pipe installation construction" "$BASE_DIR/projects" "drenering.jpg"
echo ""

# 5. Vei og Oppkjørsel (Roads/Driveways)
echo "[5/10] Vei og Oppkjørsel (Roads)"
fetch_image "gravel road construction" "$BASE_DIR/projects" "vei-oppkjorsel.jpg"
echo ""

# 6. Landskapsarbeid (Landscape work)
echo "[6/10] Landskapsarbeid (Landscape)"
fetch_image "retaining wall construction stone" "$BASE_DIR/projects" "landskapsarbeid.jpg"
echo ""

# 7. Hyttetomter (Cabin sites)
echo "[7/10] Hyttetomter (Cabin Sites)"
fetch_image "cabin site mountain construction" "$BASE_DIR/projects" "hyttetomter.jpg"
echo ""

# 8. Service page hero - mini excavator
echo "[8/10] Services Hero"
fetch_image "mini excavator residential" "$BASE_DIR/services" "services-hero.jpg"
echo ""

# 9. About page - contractor professional
echo "[9/10] About/Professional"
fetch_image "construction worker professional" "$BASE_DIR/about" "professional.jpg"
echo ""

# 10. Equipment image
echo "[10/10] Equipment Image"
fetch_image "excavator machine yellow" "$BASE_DIR/hero" "equipment.jpg"
echo ""

echo "================================================"
echo "Image fetching complete!"
echo "================================================"

# List downloaded images
echo ""
echo "Downloaded images:"
find "$BASE_DIR" -name "*.jpg" -type f 2>/dev/null | while read f; do
    size=$(ls -lh "$f" | awk '{print $5}')
    echo "  $f ($size)"
done
