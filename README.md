# Boda Logistics Engine 2025

A specialized routing algorithm designed for motorcycle (Boda Boda) transport in high-density informal settlements. Traditional GPS routing often fails in these areas due to unmapped alleys and extreme traffic variability.

## Features
- **Agility Weighted Routing**: Prioritizes narrow passages accessible only to motorcycles.
- **Congestion Factor Support**: Real-time traffic density integration.
- **Informal Settlement Mapping**: Optimized for non-standard path types like `ALLEY` and `NARROW_PASSAGE`.

## Setup
```bash
npm install
npm run build
```

## Technology
- TypeScript 5.0+
- Graph-based Dijkstra implementation