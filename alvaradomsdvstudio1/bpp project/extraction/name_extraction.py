import json
import spacy

# Load spaCy English language model
nlp = spacy.load('en_core_web_sm')

# Load JSON data from file
with open('black_panther_party_results(3).json', 'r') as file:
    data = json.load(file)

# Names to keep dictionary
names_to_keep = set([
    "David Hilliard", 
    "Captain David Hilliard",
    "Fred Hampton", 
    "Chairman Fred Hampton",
    "Angela Davis", 
    "Free Angela",
    "Angela Yvonne Davis",
    "Bobby Seale", 
    "Huey Newton", 
    "Huey P Newton",
    "Free Huey",
    "Elaine Brown", 
    "Kathleen Cleaver", 
    "Kathleen Cleaver PhD",
    "Kathleen Cleaver Ph",
    "Eldridge Cleaver", 
    "Stokely Carmichael",
    "Kwame Ture",
    "Pirkle Jones",
    "Bobby Hutton",
    "Robert James Hutton",
    "Bobby Hutton Memorial Park",
    "Stephen Shames",
    "Unidentified Man",
    "Unidentified Woman",
    "Unidentified Child",
    "Black Panther Party",
    "Bobby Seale",
    "Marion Baruch",
    "Blair Stapp",
    "Emory Douglas",
    "Michael Hoerger",
    "Arthur Glenn Morris",
    "Thomas",
    "Lewis",
    "Stephen",
    "Lawrence",
    "Bartholomew",
    "William Lee Brent",
    "Raymond Johnson Jr",
    "David Lewis",
    "James Burford",
    "Jamil Abdullah Al",
    "H Rap Brown",
    "Rap Brown",
    "Amiri Baraka",
    "Ed Bullins",
    "Roscoe Orman",
    "Enrique Vargas",
    "Leroi Jones",
    "Unitarian Church",
    "Alan Copeland",
    "Mark James",
    "Hiram Maristany",
    "Lisa Lyons",
    "Reis Tijerina",
    "Ivan Dixon",
    "Mike Klonsky",
    "Jesse Steve Rose",
    "Denise Oliver",
    "Mickey Agrait",
    "Mary Ann Carlton",
    "Delores Henderson",
    "Joyce Lee",
    "Joyce Means",
    "Paula Hill",
    "Rafael Viera",
    "Young Lords",
    "Melvin Newton",
    "Bob Fletcher",
    "Faith Ringgold",
    "Frank Espada",
    "Bobby Rush",
    "Congressman Rush"
])

# Name mapping dictionary - mapping variations to a canonical name
name_mapping = {
    "Capt David Hilliard": "David Hilliard",
    "Chairman Fred Hampton": "Fred Hampton",
    "Comrade Angela Davis": "Angela Davis",
    "Free Angela": "Angela Davis",
    "Angela Yvonne Davis": "Angela Davis",
    "Chief of Staff Bobby Seale": "Bobby Seale",
    "Minister of Defense Huey Newton": "Huey Newton",
    "Sister Elaine Brown": "Elaine Brown",
    "Kathleen Neal Cleaver": "Kathleen Cleaver",
    "Eldridge Cleaver PhD": "Eldridge Cleaver",
    "Kwame Ture (Stokely Carmichael)": "Stokely Carmichael",
    "Free Huey": "Huey Newton",
    "Huey P Newton": "Huey Newton",
    "Kathleen Cleaver Ph": "Kathleen Cleaver PhD",
    "Robert James Hutton": "Bobby Hutton",
    "Bobby Hutton Memorial Park": "Bobby Hutton",
    "Rap Brown": "H Rap Brown",
    "Congressman Rush": "Bobby Rush"
}

# Extract names from each entry using NLP
metadata_list = []
extracted_names = []
cleaned_names = []
for entry in data:
    names = []
    # Extract from 'title', 'description', and 'names' fields
    for field in ['title', 'description', 'names']:
        if field in entry and entry[field]:
            if field == 'names':
                # If the field is 'names', process it as a list of strings
                for name in entry[field]:
                    canonical_name = name_mapping.get(name, name)
                    if canonical_name in names_to_keep:
                        names.append(canonical_name)
                        extracted_names.append(canonical_name)
            else:
                # Process 'title' and 'description' as text with NLP
                doc = nlp(entry[field])
                for ent in doc.ents:
                    if ent.label_ in ['PERSON', 'ORG']:
                        # Apply name mapping if the name exists in the name_mapping dictionary
                        canonical_name = name_mapping.get(ent.text, ent.text)
                        # Add the canonical name if it's in the names to keep set
                        if canonical_name in names_to_keep:
                            names.append(canonical_name)
                            extracted_names.append(canonical_name)

    # Convert list to set to remove duplicates, then back to list
    if names:
        metadata = {
            'names': list(set(names)),
            'title': entry.get('title', 'N/A'),
            'link': entry.get('link', 'N/A'),
            'place': entry.get('place', 'N/A'),
            'description': entry.get('description', 'N/A')
        }
        metadata_list.append(metadata)

# Create a list of cleaned and matched names
cleaned_names = list(set(extracted_names))

# Save extracted names and metadata to a JSON file
with open('extracted_names_metadata.json', 'w') as outfile:
    json.dump(metadata_list, outfile, indent=2)

# Save the list of extracted and matched names to a JSON file
with open('extracted_names_list.json', 'w') as outfile:
    json.dump(cleaned_names, outfile, indent=2)

print("Extracted names and metadata saved to 'extracted_names_metadata.json'")
print("Extracted names list saved to 'extracted_names_list.json'")
print("Cleaned and matched names saved to 'extracted_names_list.json'")
