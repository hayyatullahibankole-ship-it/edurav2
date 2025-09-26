-- Add default explanations for questions that don't have explanations
UPDATE questions 
SET explanation = CASE 
  WHEN subject_id IN (SELECT id FROM subjects WHERE name = 'Mathematics') 
    THEN 'This mathematical concept requires understanding of fundamental principles. Review the topic and practice similar problems.'
  WHEN subject_id IN (SELECT id FROM subjects WHERE name = 'Physics') 
    THEN 'This physics question involves understanding of physical laws and principles. Study the underlying concepts and formulas.'
  WHEN subject_id IN (SELECT id FROM subjects WHERE name = 'Chemistry') 
    THEN 'This chemistry question requires knowledge of chemical reactions, properties, and equations. Review the periodic table and chemical principles.'
  WHEN subject_id IN (SELECT id FROM subjects WHERE name = 'Biology') 
    THEN 'This biology question covers living organisms and their processes. Study the biological systems and their interactions.'
  WHEN subject_id IN (SELECT id FROM subjects WHERE name = 'Economics') 
    THEN 'This economics question involves understanding of economic principles, market forces, and financial systems.'
  WHEN subject_id IN (SELECT id FROM subjects WHERE name = 'Geography') 
    THEN 'This geography question covers physical and human geography concepts. Study maps, climate, and geographical features.'
  WHEN subject_id IN (SELECT id FROM subjects WHERE name = 'Government') 
    THEN 'This government question involves political systems, governance, and civic knowledge. Review constitutional principles.'
  WHEN subject_id IN (SELECT id FROM subjects WHERE name = 'History') 
    THEN 'This history question covers historical events, dates, and their significance. Study the chronology and causes of events.'
  WHEN subject_id IN (SELECT id FROM subjects WHERE name = 'Literature in English') 
    THEN 'This literature question involves understanding of literary works, themes, and analysis. Read and analyze the text carefully.'
  ELSE 'Review the relevant course materials and practice similar questions to better understand this concept.'
END
WHERE (explanation IS NULL OR explanation = '') 
AND is_active = true;