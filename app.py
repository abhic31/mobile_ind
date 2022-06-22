import uvicorn
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return { "Lux app": "Welcome to Lux app" }
    

@app.get("/items")
async def read_item(seq, ss):
    return [{"seq": seq
            ,"ss": ss}]




if __name__ == "__main__":
    
 uvicorn.run(app)