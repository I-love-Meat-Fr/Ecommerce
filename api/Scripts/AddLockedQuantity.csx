using MongoDB.Bson;
using MongoDB.Driver;

var connectionString = "mongodb+srv://nguyenquocanh170205_db_user:FJGAwn7TMMPkcslN@cluster0.2pu37z6.mongodb.net/ecommer?retryWrites=true&w=majority";
var client = new MongoClient(connectionString);
var db = client.GetDatabase("ecommer");
var collection = db.GetCollection<BsonDocument>("products");

// Step 1: Add lockedQuantity = 0 to every variant in every product that doesn't have it
var addToVariantFilter = Builders<BsonDocument>.Filter.Or(
    Builders<BsonDocument>.Filter.Exists("variants.lockedQuantity", false),
    Builders<BsonDocument>.Filter.ElemMatch<BsonDocument>("variants",
        Builders<BsonDocument>.Filter.Exists("lockedQuantity", false))
);

var products = await collection.Find(new BsonDocument()).ToListAsync();
int updated = 0;

foreach (var product in products)
{
    var variants = product.GetValue("variants", new BsonArray()).AsBsonArray;
    var needsUpdate = false;
    var newVariants = new BsonArray();

    foreach (var variant in variants)
    {
        if (!variant.AsBsonDocument.Contains("lockedQuantity"))
        {
            variant.AsBsonDocument.Add("lockedQuantity", 0);
            needsUpdate = true;
        }
        newVariants.Add(variant);
    }

    if (needsUpdate)
    {
        var update = Builders<BsonDocument>.Update.Set("variants", newVariants);
        await collection.UpdateOneAsync(product, update);
        updated++;
        Console.WriteLine($"  Updated product {product["_id"]}: added lockedQuantity to variants");
    }
}

Console.WriteLine($"\nMigration complete. Updated {updated} products.");

// Step 2: Verify
var sample = await collection.Find(new BsonDocument()).Limit(1).FirstOrDefaultAsync();
if (sample != null)
{
    var variants = sample.GetValue("variants", new BsonArray());
    if (variants.Count > 0)
    {
        var firstVariant = variants[0].AsBsonDocument;
        Console.WriteLine($"Sample product first variant has lockedQuantity: {firstVariant.GetValue("lockedQuantity", "MISSING")}");
    }
}
