CREATE TABLE public.ai_tutor_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New chat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_tutor_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.ai_tutor_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_tutor_threads_user ON public.ai_tutor_threads(user_id, updated_at DESC);
CREATE INDEX idx_ai_tutor_messages_thread ON public.ai_tutor_messages(thread_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_tutor_threads TO authenticated;
GRANT ALL ON public.ai_tutor_threads TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_tutor_messages TO authenticated;
GRANT ALL ON public.ai_tutor_messages TO service_role;

ALTER TABLE public.ai_tutor_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own tutor threads"
ON public.ai_tutor_threads FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own tutor messages"
ON public.ai_tutor_messages FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_ai_tutor_threads_updated_at
BEFORE UPDATE ON public.ai_tutor_threads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();