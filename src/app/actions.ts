"use server";

import { generateActionableChecklist } from "@/ai/flows/generate-actionable-checklist";
import { identifyRiskFactors } from "@/ai/flows/identify-risk-factors";
import { summarizeLegalDocument } from "@/ai/flows/summarize-legal-document";
import { explainSimplifiedClause } from "@/ai/flows/explain-simplified-clause";
import { translateDocument } from "@/ai/flows/translate-document";
import { generateSpeech } from "@/ai/flows/generate-speech";
import { extractTextFromDocument } from "@/ai/flows/extract-text-from-document";
import { answerDocumentQuestion } from "@/ai/flows/answer-document-question";
import type { AnalysisResult } from "@/lib/types";

export async function extractTextAction(
  documentDataUri: string
): Promise<string> {
  if (!documentDataUri) {
    throw new Error("Document data URI cannot be empty.");
  }
  try {
    const result = await extractTextFromDocument({ documentDataUri });
    return result.extractedText;
  } catch (error) {
    console.error("Error extracting text from document:", error);
    // Pass the specific AI error message to the frontend if available
    if (
      error instanceof Error &&
      error.message.includes("The AI model could not find any readable text")
    ) {
      throw error;
    }
    throw new Error(
      "Failed to extract text from the document. The file format may be unsupported or the file may be corrupted."
    );
  }
}

export async function analyzeDocumentAction(
  documentText: string
): Promise<AnalysisResult> {
  if (!documentText.trim()) {
    throw new Error("Document text cannot be empty.");
  }

  try {
    const [summaryResult, riskFactorsResult, checklistResult] =
      await Promise.all([
        summarizeLegalDocument({ documentText }),
        identifyRiskFactors({ documentText }),
        generateActionableChecklist({ documentText }),
      ]);

    return {
      summary: summaryResult.summary,
      riskFactors: riskFactorsResult.riskFactors,
      checklist: checklistResult.checklist,
    };
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error("Failed to analyze the document. Please try again.");
  }
}

export async function explainClauseAction(
  documentText: string,
  clause: string
): Promise<string> {
  if (!documentText.trim() || !clause.trim()) {
    throw new Error("Document text and clause cannot be empty.");
  }
  try {
    const result = await explainSimplifiedClause({ documentText, clause });
    return result.simplifiedExplanation;
  } catch (error) {
    console.error("Error explaining clause:", error);
    throw new Error("Failed to explain the clause. Please try again.");
  }
}

export async function askQuestionAction(
  documentText: string,
  question: string
): Promise<string> {
  if (!documentText.trim() || !question.trim()) {
    throw new Error("Document text and question cannot be empty.");
  }
  try {
    const result = await answerDocumentQuestion({ documentText, question });
    return result.answer;
  } catch (error) {
    console.error("Error answering question:", error);
    throw new Error("Failed to get an answer. Please try again.");
  }
}

export async function translateAnalysisAction(
  analysis: AnalysisResult,
  targetLanguage: string
): Promise<AnalysisResult> {
  if (!analysis || !targetLanguage) {
    throw new Error("Analysis and target language are required.");
  }

  const translateText = async (
    text: string | null | undefined
  ): Promise<string> => {
    if (!text) return "";
    try {
      const result = await translateDocument({
        documentText: text,
        targetLanguage,
      });
      return result.translatedText;
    } catch (error) {
      console.error(`Error translating text to ${targetLanguage}:`, error);
      // Return original text if translation fails for a single field
      return text;
    }
  };

  const translateArray = async (items: string[]): Promise<string[]> => {
    if (!items || items.length === 0) return [];
    // Promise.all is good, but if one fails, all fail. We want partial success.
    const translatedItems = await Promise.all(
      items.map((item) => translateText(item))
    );
    return translatedItems;
  };

  try {
    const [translatedSummary, translatedRisks, translatedChecklist] =
      await Promise.all([
        translateText(analysis.summary),
        translateArray(analysis.riskFactors),
        translateText(analysis.checklist),
      ]);

    return {
      summary: translatedSummary,
      riskFactors: translatedRisks,
      checklist: translatedChecklist,
    };
  } catch (error) {
    console.error("Error translating analysis:", error);
    throw new Error(
      `Failed to translate the analysis to ${targetLanguage}. Please try again.`
    );
  }
}

export async function textToSpeechAction(
  text: string
): Promise<{ audio: string | null; error?: string }> {
  if (!text.trim()) {
    return { audio: null, error: "Text cannot be empty." };
  }
  try {
    const result = await generateSpeech(text);
    return { audio: result.media };
  } catch (error) {
    console.error("Error in text-to-speech action:", error);
    return {
      audio: null,
      error: "Failed to generate audio. Please try again.",
    };
  }
}
