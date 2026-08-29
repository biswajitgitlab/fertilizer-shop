import json
import re

with open('fertilizer-web/src/utils/constants.ts', 'r') as f:
    content = f.read()

# Extract CATEGORIES
categories_match = re.search(r'export const CATEGORIES:\s*Category\[\]\s*=\s*(\[.*?\]);', content, re.DOTALL)
if categories_match:
    # replace single quotes, etc., though it looks like valid JS object
    cat_str = categories_match.group(1)
    # Convert JS object to JSON
    cat_str = re.sub(r'(\w+):', r'"\1":', cat_str)
    cat_str = cat_str.replace("'", '"')
    # handle trailing commas
    cat_str = re.sub(r',\s*\]', ']', cat_str)
    cat_str = re.sub(r',\s*\}', '}', cat_str)
    categories = json.loads(cat_str)
else:
    categories = []

# Extract INITIAL_PRODUCTS
products_match = re.search(r'export const INITIAL_PRODUCTS:\s*Product\[\]\s*=\s*(\[.*?\]);', content, re.DOTALL)
if products_match:
    prod_str = products_match.group(1)
    prod_str = re.sub(r'([{,]\s*)(\w+):', r'\1"\2":', prod_str)
    prod_str = prod_str.replace("'", '"')
    prod_str = re.sub(r',\s*\]', ']', prod_str)
    prod_str = re.sub(r',\s*\}', '}', prod_str)
    try:
        products = json.loads(prod_str)
    except Exception as e:
        print("Error parsing products:", e)
        products = []
else:
    products = []

php_code = "<?php\n\nnamespace Database\\Seeders;\n\nuse App\\Models\\Category;\nuse App\\Models\\Product;\nuse Illuminate\\Database\\Seeder;\nuse Illuminate\\Support\\Str;\n\nclass ConstantsSeeder extends Seeder\n{\n    public function run(): void\n    {\n"

php_code += "        $categories = [\n"
for c in categories:
    php_code += f"            ['name' => '{c['name']}', 'slug' => '{c['slug']}'],\n"
php_code += "        ];\n\n"
php_code += "        foreach ($categories as $cat) {\n"
php_code += "            Category::firstOrCreate(['slug' => $cat['slug']], ['name' => $cat['name'], 'sort_order' => 0]);\n"
php_code += "        }\n\n"

php_code += "        $products = [\n"
for p in products:
    images_json = json.dumps(p.get('images', []))
    composition_json = json.dumps(p.get('npk', {}))
    suitable_crops_json = json.dumps(p.get('suitableCrops', []))
    desc = p.get('description', '').replace("'", "\\'")
    short_desc = p.get('shortDescription', '').replace("'", "\\'")
    usage = p.get('usageInstructions', '').replace("'", "\\'")
    name = p.get('name', '').replace("'", "\\'")
    
    php_code += "            [\n"
    php_code += f"                'name' => '{name}',\n"
    php_code += f"                'slug' => '{p['slug']}',\n"
    php_code += f"                'category_slug' => '{p['categorySlug']}',\n"
    php_code += f"                'price' => {p.get('price', 0)},\n"
    php_code += f"                'discount_price' => {p.get('originalPrice', 0)},\n"
    php_code += f"                'unit' => '{p.get('unit', '')}',\n"
    php_code += f"                'stock_qty' => {p.get('stock', 0)},\n"
    php_code += f"                'reviews_avg_rating' => {p.get('rating', 0)},\n"
    php_code += f"                'reviews_count' => {p.get('reviewsCount', 0)},\n"
    php_code += f"                'is_featured' => {str(p.get('isFeatured', False)).lower()},\n"
    php_code += f"                'images_json' => {images_json},\n"
    php_code += f"                'composition_json' => {composition_json},\n"
    php_code += f"                'suitable_crops_json' => {suitable_crops_json},\n"
    php_code += f"                'short_desc' => '{short_desc}',\n"
    php_code += f"                'description' => '{desc}',\n"
    php_code += f"                'usage_instructions' => '{usage}',\n"
    php_code += "            ],\n"
php_code += "        ];\n\n"

php_code += """        foreach ($products as $prod) {
            $catSlug = $prod['category_slug'];
            unset($prod['category_slug']);
            $category = Category::where('slug', $catSlug)->first();
            if ($category) {
                $prod['category_id'] = $category->id;
            }
            Product::firstOrCreate(['slug' => $prod['slug']], $prod);
        }
    }
}
"""

with open('fertilizer-api/database/seeders/ConstantsSeeder.php', 'w') as f:
    f.write(php_code)

print("Generated ConstantsSeeder.php")
