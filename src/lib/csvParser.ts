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
  if (s.includes("KOUDIA") || s.includes("KOUDIAT") || s.includes("AICHA")) return "KOUDIA";
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

/**
 * Valide et formate une date à partir de composants numériques
 */
function validateAndFormatDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  
  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return null;
  }

  const mm = month.toString().padStart(2, "0");
  const dd = day.toString().padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * Parse une date de façon flexible (accepte YYYY-MM-DD et DD/MM/YYYY) et la normalise en YYYY-MM-DD.
 * Privilégie le format DD/MM/YYYY par défaut (contexte France/Maroc).
 */
export function parseFlexibleDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const cleanStr = dateStr.trim();

  // Test YYYY-MM-DD ou YYYY/MM/DD
  const isoMatch = cleanStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    return validateAndFormatDate(year, month, day);
  }

  // Test DD/MM/YYYY ou MM/DD/YYYY
  const frMatch = cleanStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (frMatch) {
    const part1 = parseInt(frMatch[1], 10);
    const part2 = parseInt(frMatch[2], 10);
    const year = parseInt(frMatch[3], 10);

    let day = part1;
    let month = part2;

    if (part1 > 12 && part2 <= 12) {
      // ex: 15/06/2023 -> Jour 15, Mois 06
      day = part1;
      month = part2;
    } else if (part1 <= 12 && part2 > 12) {
      // ex: 06/15/2023 -> Mois 06, Jour 15
      day = part2;
      month = part1;
    } else if (part1 <= 12 && part2 <= 12) {
      // Privilégie JJ/MM/AAAA -> Part1 est le Jour, Part2 est le Mois
      day = part1;
      month = part2;
    } else {
      // Les deux valeurs sont > 12 (ex: 15/15/2023)
      return null;
    }

    return validateAndFormatDate(year, month, day);
  }

  return null;
}

