Portfolio (statisk) - minimal mall

This folder contains a simple, dependency-free portfolio template (HTML/CSS/JS) with pages: Home, About, Projects and Contact.

Hur du kör lokalt
- Öppna filen `index.html` i webbläsaren direkt (fungerar men vissa fetch-anrop kräver HTTP).
- Recommended: run a simple local HTTP server from the project folder.

PowerShell (om du har Python installerat):
```powershell
cd 'C:\Users\KarlY\OneDrive\Skrivbord\Portfolio2025\portfolio-site'
python -m http.server 8000
# Öppna http://localhost:8000 i webbläsaren
```

Alternativt (PowerShell med .NET):
```powershell
cd 'C:\Users\KarlY\OneDrive\Skrivbord\Portfolio2025\portfolio-site'
# Om du har Live Server i VS Code, tryck "Open with Live Server"
```

Anpassningar
- Replace the name in the header and the `mailto` address in `js/main.js`.
- Update the GitHub username by changing `data-github-user` on `index.html` (body attribute). Default is `KarlYbring`.

Nästa steg jag kan hjälpa med
- Lägga till en Dockerfile och GitHub Actions (CI) för publicering
- Konvertera till Next.js / Vercel‑optimerad site
- Automatiskt generera projektkort från flera repo‑källor
