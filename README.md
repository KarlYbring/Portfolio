# Portfolio — Karl Ybring

Detta är min personliga portfolio (statisk HTML/CSS/JS) som visar projekt, kontaktformulär och en enkel GitHub‑repo‑lista.

## Innehåll
- Index (startsida) med hero, About, Projects och Contact
- Kontakt: EmailJS eller mailto-fallback
- Hämtning av publika GitHub‑repos via GitHub API

## Teknisk stack
- HTML, CSS, Vanilla JavaScript
- EmailJS (client-side) för formulärsändning
- Fungerar som statisk site (kan servas med vilken statisk host som helst)

## Kör lokalt (snabbt)
1. Öppna en terminal/PowerShell i mappen `portfolio-site`.
2. Kör en enkel lokal server (om du har Node.js):
   ```powershell
   npx http-server . -p 8000
   ```

## PowerShell (om du har Python installerat):
```powershell
cd 'C:\Users\KarlY\OneDrive\Skrivbord\Portfolio2025\portfolio-site'
python -m http.server 8000
# Öppna http://localhost:8000 i webbläsaren
```

## Alternativt (PowerShell med .NET):
```powershell
cd 'C:\Users\KarlY\OneDrive\Skrivbord\Portfolio2025\portfolio-site'
# Om du har Live Server i VS Code, tryck "Open with Live Server"
```

## Anpassningar
- Replace the name in the header and the `mailto` address in `js/main.js`.
- Update the GitHub username by changing `data-github-user` on `index.html` (body attribute). Default is `KarlYbring`.

## Nästa steg jag kan hjälpa med
- Lägga till en Dockerfile och GitHub Actions (CI) för publicering
- Konvertera till Next.js / Vercel‑optimerad site
- Automatiskt generera projektkort från flera repo‑källor
