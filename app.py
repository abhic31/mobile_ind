import uvicorn
import RNA as rna
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return { "Lux app": "Welcome to Lux app" }
    

@app.get("/items")
async def read_item(seq, ss):
#todo: # Calculate MFE and Secondary Structure
    fc_obj = rna.fold_compound(
        ss,
        seq,)
    ss, seq = fc_obj.mfe()

    return [{"seq": seq
            ,"ss": ss}]




if __name__ == "__main__":
    
 uvicorn.run(app)