export interface IAiAnalysisResult {
  detectedCategory: string;
  confidenceScore: number;
  estimatedPriority: 'Low' | 'Medium' | 'High' | 'Critical';
  sentimentScore: number;
  explanation: string;
}

export interface ITranslationResult {
  title: string;
  content: string;
}

export interface IAssetRiskResult {
  anomalyDetected: boolean;
  failureRiskScore: number;
  recommendedAction: string;
  nextPredictedFailureDate?: Date;
}

export class AiService {
  /**
   * Analyzes resident complaints to classify, prioritize, evaluate sentiment, and explain decisions.
   */
  public static async analyzeComplaint(title: string, description: string): Promise<IAiAnalysisResult> {
    const text = `${title} ${description}`.toLowerCase();
    
    // Default Mock Category detection
    let detectedCategory = 'General';
    let confidenceScore = 0.85;
    let estimatedPriority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
    let explanation = 'Classified automatically based on keywords.';

    if (text.includes('leak') || text.includes('plumb') || text.includes('water') || text.includes('pipe') || text.includes('tap')) {
      detectedCategory = 'Plumbing';
      confidenceScore = 0.95;
    } else if (text.includes('lift') || text.includes('elevator')) {
      detectedCategory = 'Elevator/Lift';
      confidenceScore = 0.98;
    } else if (text.includes('power') || text.includes('electric') || text.includes('wire') || text.includes('shock') || text.includes('generator')) {
      detectedCategory = 'Electrical';
      confidenceScore = 0.96;
    } else if (text.includes('guard') || text.includes('theft') || text.includes('intruder') || text.includes('gate') || text.includes('security')) {
      detectedCategory = 'Security';
      confidenceScore = 0.92;
    } else if (text.includes('garbage') || text.includes('clean') || text.includes('waste') || text.includes('smell')) {
      detectedCategory = 'Housekeeping';
      confidenceScore = 0.90;
    }

    // Sentiment Analysis Mock (-1 to 1)
    let sentimentScore = 0.0;
    const negativeWords = ['leak', 'ruined', 'broken', 'emergency', 'worst', 'poor', 'danger', 'shock', 'damage', 'awful', 'stink', 'dripping'];
    const positiveWords = ['request', 'setup', 'installation', 'inquiry', 'install'];

    let negCount = 0;
    let posCount = 0;
    negativeWords.forEach(w => { if (text.includes(w)) negCount++; });
    positiveWords.forEach(w => { if (text.includes(w)) posCount++; });

    if (negCount > 0) {
      sentimentScore = Math.max(-1.0, -0.2 * negCount);
    } else if (posCount > 0) {
      sentimentScore = Math.min(1.0, 0.2 * posCount);
    }

    // Priority Inference logic
    if (text.includes('urgent') || text.includes('emergency') || text.includes('danger') || text.includes('fire') || text.includes('shock') || text.includes('flood') || (detectedCategory === 'Elevator/Lift' && text.includes('stuck'))) {
      estimatedPriority = 'Critical';
      explanation = 'Critical urgency flags raised by safety keywords.';
    } else if (negCount >= 3 || text.includes('broken') || text.includes('leak')) {
      estimatedPriority = 'High';
      explanation = 'High priority computed due to structural complaints or multiple negative sentiments.';
    } else if (text.includes('request') || text.includes('inquiry') || text.includes('feedback')) {
      estimatedPriority = 'Low';
      explanation = 'Low priority assigned to queries or standard requests.';
    } else {
      estimatedPriority = 'Medium';
      explanation = 'Assigned standard medium response priority.';
    }

    // Check if real OpenAI API is available
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: `You are an expert triage assistant for a residential society. Classify the user's issue into one of: 'Plumbing', 'Electrical', 'Elevator/Lift', 'Security', 'Housekeeping', 'General'. Estimate the urgency/priority: 'Low', 'Medium', 'High', 'Critical'. Score sentiment from -1.0 (extremely angry/distressed) to 1.0 (highly happy). Provide a brief explanation. Return JSON only: { "detectedCategory": "...", "confidenceScore": 0.XX, "estimatedPriority": "...", "sentimentScore": 0.XX, "explanation": "..." }`
              },
              { role: 'user', content: `Title: ${title}\nDescription: ${description}` }
            ]
          })
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const aiJson = JSON.parse(data.choices[0].message.content);
          return {
            detectedCategory: aiJson.detectedCategory || detectedCategory,
            confidenceScore: aiJson.confidenceScore || confidenceScore,
            estimatedPriority: aiJson.estimatedPriority || estimatedPriority,
            sentimentScore: aiJson.sentimentScore || sentimentScore,
            explanation: aiJson.explanation || explanation
          };
        }
      } catch (err) {
        console.error('[AI Service] OpenAI query failed. Falling back to local analyzer.', err);
      }
    }

    return { detectedCategory, confidenceScore, estimatedPriority, sentimentScore, explanation };
  }

  /**
   * Translates notice boards into local languages for accessibility.
   */
  public static async translateNotice(title: string, content: string, targetLanguage: string): Promise<ITranslationResult> {
    const langLower = targetLanguage.toLowerCase();
    
    // Baseline dictionary fallback
    let translatedTitle = title;
    let translatedContent = content;

    if (langLower === 'hi' || langLower === 'hindi') {
      translatedTitle = `[HINDI] ${title}`;
      translatedContent = `सूचना: ${content} (यह अनुवादित संदेश है)`;
    } else if (langLower === 'mr' || langLower === 'marathi') {
      translatedTitle = `[MARATHI] ${title}`;
      translatedContent = `सूचना: ${content} (हा अनुवादित संदेश आहे)`;
    }

    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: `Translate the notice title and description into target language: ${targetLanguage}. Return JSON only: { "title": "translated...", "content": "translated..." }`
              },
              { role: 'user', content: `Title: ${title}\nContent: ${content}` }
            ]
          })
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const aiJson = JSON.parse(data.choices[0].message.content);
          return {
            title: aiJson.title || translatedTitle,
            content: aiJson.content || translatedContent
          };
        }
      } catch (err) {
        console.error('[AI Service] Notice translation failed. Using default placeholders.', err);
      }
    }

    return { title: translatedTitle, content: translatedContent };
  }

  /**
   * Calculates telemetry indicators to flag pump or elevator failure risks.
   */
  public static async scoreAssetFailureRisk(
    assetName: string, 
    telemetry: { vibrationLevel?: number; temperatureCelsius?: number; operatingHours?: number }
  ): Promise<IAssetRiskResult> {
    const temp = telemetry.temperatureCelsius || 40;
    const vib = telemetry.vibrationLevel || 1.5;
    const hours = telemetry.operatingHours || 100;

    let anomalyDetected = false;
    let failureRiskScore = 10;
    let recommendedAction = 'Routine inspections.';

    // Rule-based anomaly profiling
    if (temp > 85 || vib > 5.0 || hours > 5000) {
      anomalyDetected = true;
      failureRiskScore = 90;
      recommendedAction = 'Emergency service required. High vibration or thermal overload detected.';
    } else if (temp > 70 || vib > 3.0 || hours > 2000) {
      anomalyDetected = true;
      failureRiskScore = 55;
      recommendedAction = 'Schedule preventive maintenance within 7 days. Mild overheating detected.';
    }

    const nextPredictedFailureDate = anomalyDetected 
      ? new Date(Date.now() + 1000 * 60 * 60 * 24 * (failureRiskScore > 80 ? 2 : 7)) 
      : undefined;

    return { anomalyDetected, failureRiskScore, recommendedAction, nextPredictedFailureDate };
  }
}
