/**
 * Utilitaire de parsing robuste pour les fichiers CSV d'imports GMAO
 * Gère les séparateurs de colonnes (, et ;) et les champs entourés de guillemets.
 */

export interface ParserResult<T> {
  success: T[];
  errors: {
    line: number;
    message: string;
    raw?: string;
  }[];
  stats: {
    total: number;
    imported: number;
    ignored: number;
    errorsCount: number;
  };
}

/**
 * Parse une ligne CSV en tenant compte des guillemets et séparateurs (virgule ou point-virgule)
 */
export function parseCSVLine(line: string, separator: string = ","): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Détecte le séparateur le plus probable (virgule ou point-virgule)
 */
export function detectSeparator(text: string): string {
  const firstLine = text.split("\n")[0] || "";
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semicolons > commas ? ";" : ",";
}

/**
 * Convertit un texte CSV complet en tableau d'objets clé-valeur
 */
export function csvToObjects(text: string): { [key: string]: string }[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length === 0) return [];

  const separator = detectSeparator(text);
  const headers = parseCSVLine(lines[0], separator).map(h => h.toLowerCase().replace(/["\s]/g, ""));
  
  const results: { [key: string]: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i], separator);
    const obj: { [key: string]: string } = {};
    headers.forEach((header, index) => {
      obj[header] = fields[index] !== undefined ? fields[index] : "";
    });
    // Record original line number for error reporting (1-indexed, +1 because loop is 1-indexed)
    obj["_lineNumber"] = (i + 1).toString();
    obj["_rawLine"] = lines[i];
    results.push(obj);
  }

  return results;
}

/**
 * Normalise le nom d'un site minier marocain
 */
export function normalizeSite(site: string): string {
  const s = site.toUpperCase().trim();
  if (s.includes("SMI")) return "SMI";
  if (s.includes("OUMEJRANE") || s.includes("OUM")) return "OUMEJRANE";
  if (s.includes("KOUDIA") || s.includes("KOUDIAT") || s.includes("AICHA")) return "KOUDIAT AICHA";
  if (s.includes("BOU-AZZER") || s.includes("BOU_AZZER") || s.includes("BOUAZZER") || s.includes("AZZER")) return "BOU-AZZER";
  if (s.includes("OUANSIMI") || s.includes("SIMI")) return "OUANSIMI";
  return s; // retour par défaut
}

/**
 * Valide une date au format YYYY-MM-DD
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const reg = /^\d{4}-\d{2}-\d{2}$/;
  if (!reg.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}
