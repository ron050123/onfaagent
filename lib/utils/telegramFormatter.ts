/**
 * Format message for Telegram with HTML styling
 * Converts markdown to Telegram HTML format and improves readability
 */

/**
 * Escape HTML special characters for Telegram HTML format
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function formatTelegramMessage(text: string): string {
  if (!text) return '';

  let formatted = text;

  // Normalize line breaks
  formatted = formatted.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Normalize multiple consecutive newlines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  formatted = formatted.replace(/\n{2}/g, '\n');

  // Split into lines for processing
  const lines = formatted.split('\n');
  const processedLines: string[] = [];
  
  lines.forEach((line) => {
    let processedLine = line;
    
    // Step 1: Process numbered lists (1. 2. 3.)
    const numberedMatch = processedLine.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const content = numberedMatch[2];
      // Process markdown in content first
      let processedContent = content;
      
      // Convert markdown bold **text** to placeholder
      processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '__BOLD__$1__BOLD__');
      
      // Convert markdown code `code` to placeholder
      processedContent = processedContent.replace(/`([^`]+)`/g, '__CODE__$1__CODE__');
      
      // Escape HTML
      processedContent = escapeHtml(processedContent);
      
      // Replace placeholders with HTML tags (need to handle opening and closing)
      let boldCount = 0;
      processedContent = processedContent.replace(/__BOLD__/g, () => {
        boldCount++;
        return boldCount % 2 === 1 ? '<b>' : '</b>';
      });
      
      let codeCount = 0;
      processedContent = processedContent.replace(/__CODE__/g, () => {
        codeCount++;
        return codeCount % 2 === 1 ? '<code>' : '</code>';
      });
      
      processedLines.push(`<b>${num}.</b> ${processedContent}`);
      return;
    }
    
    // Step 2: Process bullet points (- or •)
    const bulletMatch = processedLine.match(/^[-•]\s+(.+)$/);
    if (bulletMatch) {
      let processedContent = bulletMatch[1];
      
      // Convert markdown bold **text** to placeholder
      processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '__BOLD__$1__BOLD__');
      
      // Convert markdown code `code` to placeholder
      processedContent = processedContent.replace(/`([^`]+)`/g, '__CODE__$1__CODE__');
      
      // Escape HTML
      processedContent = escapeHtml(processedContent);
      
      // Replace placeholders with HTML tags (need to handle opening and closing)
      let boldCount = 0;
      processedContent = processedContent.replace(/__BOLD__/g, () => {
        boldCount++;
        return boldCount % 2 === 1 ? '<b>' : '</b>';
      });
      
      let codeCount = 0;
      processedContent = processedContent.replace(/__CODE__/g, () => {
        codeCount++;
        return codeCount % 2 === 1 ? '<code>' : '</code>';
      });
      
      processedLines.push(`• ${processedContent}`);
      return;
    }
    
    // Step 3: Process regular lines with markdown
    // Convert markdown code `code` FIRST (uses backticks, no conflict)
    processedLine = processedLine.replace(/`([^`]+)`/g, '__CODE__$1__CODE__');
    
    // Convert markdown bold **text** to placeholder
    processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '__BOLD__$1__BOLD__');
    
    // Escape HTML (this will escape our placeholders too)
    processedLine = escapeHtml(processedLine);
    
    // Replace placeholders with HTML tags (need to handle opening and closing)
    let boldCount = 0;
    processedLine = processedLine.replace(/__BOLD__/g, () => {
      boldCount++;
      return boldCount % 2 === 1 ? '<b>' : '</b>';
    });
    
    let codeCount = 0;
    processedLine = processedLine.replace(/__CODE__/g, () => {
      codeCount++;
      return codeCount % 2 === 1 ? '<code>' : '</code>';
    });
    
    processedLines.push(processedLine);
  });

  formatted = processedLines.join('\n');

  // Add spacing after headings (lines ending with :)
  formatted = formatted.replace(/^(.+):\n/gm, '$1:\n\n');

  // Clean up multiple spaces
  formatted = formatted.replace(/[ \t]{2,}/g, ' ');

  // Trim leading/trailing whitespace
  formatted = formatted.trim();

  return formatted;
}
