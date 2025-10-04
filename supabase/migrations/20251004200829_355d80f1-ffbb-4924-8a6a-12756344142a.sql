-- Fix incorrect correct_answer indices for specific questions discovered during review
-- Store numeric indices as jsonb

UPDATE public.questions SET correct_answer = to_jsonb(3)
WHERE id = '1027bf15-4c85-4720-a34c-fbdc7cec876f';

UPDATE public.questions SET correct_answer = to_jsonb(1)
WHERE id = '595ee921-8d46-40bf-91aa-ac813b2503cc';

UPDATE public.questions SET correct_answer = to_jsonb(2)
WHERE id = '74cd6a74-7270-4c6a-b4ec-3506acf439d8';

UPDATE public.questions SET correct_answer = to_jsonb(1)
WHERE id = '7ea90f20-9104-44ca-93d2-b03de2bc8c03';

UPDATE public.questions SET correct_answer = to_jsonb(2)
WHERE id = 'fa091e44-2a89-48dd-900b-3f63f6fe7de2';
