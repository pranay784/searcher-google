import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface FirmResearchResult {
  markdown: string;
  sources: { uri: string; title: string }[];
}

export async function researchFirm(firmName: string): Promise<FirmResearchResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Act as a professional corporate intelligence analyst. 
  Scrape and synthesize all available public information about the firm "${firmName}" from across the web.
  
  Provide a high-density intelligence report with the following sections:
  
  1. **Executive Summary**: A concise 2-3 sentence overview of what the firm does and its current market standing.
  2. **Corporate Identity**: 
     - Industry & Sector
     - Headquarters location
     - Date founded and by whom
     - Core mission and values
  3. **Leadership & Governance**: 
     - Current CEO and key C-suite executives
     - Notable board members (if applicable)
  4. **Financial Performance & Scale**: 
     - Revenue (latest available)
     - Valuation or Market Cap
     - Funding history (if private) or Stock symbol (if public)
     - Employee count estimate
  5. **Product & Service Portfolio**: Main offerings and value proposition.
  6. **Market Intelligence**: 
     - Primary competitors and rivals
     - Recent strategic moves (M&A, partnerships, expansions)
  7. **Recent Developments & News**: Top 3-5 major headlines from the last 12 months.
  8. **Digital Footprint**: Official website and verified social media handles.
  
  Format the report in clean, professional Markdown. Use tables where appropriate for data density. 
  If certain data is unavailable, state "Data not publicly disclosed."`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const markdown = response.text || "No information found.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        uri: chunk.web!.uri,
        title: chunk.web!.title || chunk.web!.uri
      }));

    // Deduplicate sources
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      markdown,
      sources: uniqueSources,
    };
  } catch (error) {
    console.error("Error researching firm:", error);
    throw error;
  }
}
