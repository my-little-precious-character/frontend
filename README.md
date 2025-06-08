### For dev
```bash
npm install
npm run dev
```

### For deploy
1. Set .env
```
VITE_DREAMGAUSSIAN_URL=http://localhost:7722
VITE_RIGNET_URL=http://localhost:7723
VITE_DREAMGAUSSIAN_MODE=test
VITE_RIGNET_MODE=prod
```

2. Run compose
```bash
docker compose up --build -d
```
