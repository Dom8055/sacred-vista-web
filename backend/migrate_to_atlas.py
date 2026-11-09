import sys
import pymongo
from pymongo.errors import BulkWriteError

LOCAL_URI = "mongodb://127.0.0.1:27017"
LOCAL_DB = "sacred_vista"

ATLAS_URI = "mongodb+srv://onkarbhalaneom_db_user:uzaHlfjoZUPL3frf@sacredvistaprod.xya4xof.mongodb.net/?retryWrites=true&w=majority"
ATLAS_DB = "SacredVistaProd"

def migrate():
    print(f"Connecting to Local MongoDB: {LOCAL_URI} -> db: {LOCAL_DB}")
    local_client = pymongo.MongoClient(LOCAL_URI, serverSelectionTimeoutMS=5000)
    local_db = local_client[LOCAL_DB]

    print(f"Connecting to Atlas MongoDB: {ATLAS_DB}")
    atlas_client = pymongo.MongoClient(ATLAS_URI, serverSelectionTimeoutMS=10000)
    atlas_db = atlas_client[ATLAS_DB]

    collections = local_db.list_collection_names()
    print(f"Found {len(collections)} collections to migrate: {collections}\n")

    summary = {}

    for coll_name in collections:
        if coll_name.startswith("system."):
            continue

        local_coll = local_db[coll_name]
        atlas_coll = atlas_db[coll_name]

        total_local = local_coll.count_documents({})
        print(f"📦 Migrating collection '{coll_name}' ({total_local} documents)...")

        docs = list(local_coll.find({}))

        if docs:
            # Clear existing data in Atlas for this collection to avoid duplicates
            atlas_coll.delete_many({})
            try:
                res = atlas_coll.insert_many(docs, ordered=False)
                migrated_count = len(res.inserted_ids)
            except BulkWriteError as bwe:
                migrated_count = bwe.details.get("nInserted", 0)
                print(f"   ⚠️ Some docs skipped or already exist: {bwe.details}")
        else:
            migrated_count = 0

        # Migrate indexes (excluding default _id index)
        try:
            indexes = local_coll.list_indexes()
            for idx in indexes:
                idx_name = idx.get("name")
                if idx_name != "_id_":
                    keys = list(idx["key"].items())
                    unique = idx.get("unique", False)
                    atlas_coll.create_index(keys, unique=unique, name=idx_name)
                    print(f"   + Recreated index: {idx_name}")
        except Exception as e:
            print(f"   ⚠️ Could not copy indexes for '{coll_name}': {e}")

        atlas_count = atlas_coll.count_documents({})
        summary[coll_name] = {"local": total_local, "atlas": atlas_count}
        print(f"   ✓ '{coll_name}' done: local={total_local}, atlas={atlas_count}\n")

    print("=" * 50)
    print("MIGRATION SUMMARY:")
    all_matched = True
    for c, counts in summary.items():
        status = "MATCHED" if counts["local"] == counts["atlas"] else "MISMATCH"
        if status == "MISMATCH":
            all_matched = False
        print(f" - {c:20}: {counts['local']} local -> {counts['atlas']} in Atlas [{status}]")
    print("=" * 50)
    if all_matched:
        print("🎉 SUCCESS: All data copied to MongoDB Atlas successfully!")
    else:
        print("⚠️ Warning: Some counts did not match.")

if __name__ == "__main__":
    migrate()

