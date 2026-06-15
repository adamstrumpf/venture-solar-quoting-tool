---
name: venture-solar-quoting-tool infrastructure
description: GCP project, Cloud Run URL, env vars, deploy commands
type: reference
---

## Infrastructure

- **GCP project**: `venture-solar-quoting-tool` — confirmed during scaffold config
- **Cloud Run service**: `venture-solar-quoting-tool` — confirmed during scaffold config
- **Cloud Run URL**: TBD — set after first deploy
- **Region**: us-east1
- **GCS bucket**: TBD
- **GitHub repo**: TBD — set during Phase 1
- **Local path**: `~/Documents/Claude/projects/venture-solar-quoting-tool`

## Environment Variables

See `.env.example` for the full list.

## Deploy Command

```bash
gcloud run deploy venture-solar-quoting-tool --source . --region us-east1 --project venture-solar-quoting-tool
```

**Important**: Always use `--update-env-vars`, never `--set-env-vars` (the latter wipes all existing vars).
