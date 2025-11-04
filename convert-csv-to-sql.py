import csv
import sys

with open('products-export.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Handle NULL values and proper quoting
        values = []
        for key in reader.fieldnames:
            val = row[key].strip()
            if val == '' or val == 'NULL':
                values.append('NULL')
            elif key in ['id', 'price', 'stock_quantity', 'length_mm', 'width_mm', 'height_mm', 'display_order']:
                values.append(val if val else 'NULL')
            elif key in ['weight_kg']:
                values.append(val if val else 'NULL')
            elif key in ['is_active', 'is_featured']:
                values.append('true' if val == 't' else 'false')
            else:
                # Escape single quotes for strings
                escaped = val.replace("'", "''")
                values.append(f"'{escaped}'")
        
        cols = ','.join(reader.fieldnames)
        vals = ','.join(values)
        print(f"INSERT INTO products ({cols}) VALUES ({vals});")
