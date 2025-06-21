### For deploy
1. Clone
```bash
git clone git@github.com:my-little-precious-character/frontend.git
cd frontend
```
2. Set `.env`
```
VITE_DREAMGAUSSIAN_URL=http://localhost:7722
VITE_RIGNET_URL=http://localhost:7723
VITE_DREAMGAUSSIAN_MODE=prod
VITE_RIGNET_MODE=prod
```

3. Run compose
```bash
docker compose up --build -d
```
