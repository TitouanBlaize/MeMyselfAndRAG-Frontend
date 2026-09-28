import { useEffect, useState, type FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.PUBLIC_API_URL as string;

const PLACEHOLDERS = [
	'Que souhaites-tu savoir sur moi ?',
	'Quelle est ton expérience en IA générative ?',
	'Parle-moi de tes projets en data science',
	'Quelles sont tes compétences techniques ?',
	'Pourquoi devrais-je te recruter ?',
];

const SUGGESTIONS = [
	'Quels projets IA as-tu mis en production ?',
	'Quelle est ton expérience en IA générative ?',
	'Pourquoi devrais-je te recruter ?',
];

export default function Chat() {
	const [question, setQuestion] = useState('');
	const [answer, setAnswer] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [justAnswered, setJustAnswered] = useState(false);
	const [slow, setSlow] = useState(false);
	const [placeholderTick, setPlaceholderTick] = useState(0);

	useEffect(() => {
		if (question) return;
		const interval = setInterval(() => setPlaceholderTick((t) => t + 1), 2000);
		return () => clearInterval(interval);
	}, [question]);

	const currentPlaceholder = PLACEHOLDERS[placeholderTick % PLACEHOLDERS.length];
	const previousPlaceholder =
		placeholderTick > 0 ? PLACEHOLDERS[(placeholderTick - 1) % PLACEHOLDERS.length] : null;

	useEffect(() => {
		if (!answer) return;
		setJustAnswered(true);
		const timeout = setTimeout(() => setJustAnswered(false), 700);
		return () => clearTimeout(timeout);
	}, [answer]);

	useEffect(() => {
		if (!loading) {
			setSlow(false);
			return;
		}
		const timeout = setTimeout(() => setSlow(true), 5000);
		return () => clearTimeout(timeout);
	}, [loading]);

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		ask(question);
	}

	async function ask(q: string) {
		if (!q.trim() || loading) return;

		setLoading(true);
		setError(null);
		setAnswer(null);

		try {
			const res = await fetch(`${API_URL}/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question: q }),
			});

			if (!res.ok) throw new Error(`Le serveur a répondu ${res.status}`);

			const data = await res.json();
			setAnswer(data.answer);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Impossible de contacter l'assistant pour le moment."
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="w-full">
			<form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
				<div
					className={`group relative flex-1 rounded-xl transition-shadow duration-300 ${
						loading ? 'animate-[glow-pulse_1.4s_ease-in-out_infinite]' : ''
					} ${justAnswered ? 'animate-[success-flash_0.7s_ease-out]' : ''}`}
				>
					<input
						type="text"
						value={question}
						onChange={(e) => setQuestion(e.target.value)}
						aria-label={PLACEHOLDERS[0]}
						className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-base transition-all duration-300 focus:scale-[1.01] focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-300/50 focus:shadow-[0_0_20px_-4px_rgba(16,185,129,0.6)]"
					/>
					{!question && (
						<div
							aria-hidden="true"
							className="pointer-events-none absolute inset-y-0 inset-x-[17px] overflow-hidden text-stone-400 transition-transform duration-300 group-focus-within:scale-[1.01]"
						>
							{previousPlaceholder && (
								<span
									key={`out-${placeholderTick}`}
									className="absolute inset-0 flex items-center animate-[placeholder-out_0.5s_ease-in-out_forwards] motion-reduce:hidden"
								>
									<span className="truncate">{previousPlaceholder}</span>
								</span>
							)}
							<span
								key={`in-${placeholderTick}`}
								className="absolute inset-0 flex items-center animate-[placeholder-in_0.5s_ease-in-out] motion-reduce:animate-none"
							>
								<span className="truncate">{currentPlaceholder}</span>
							</span>
						</div>
					)}
				</div>
				<button
					type="submit"
					disabled={loading}
					className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-300/50 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
				>
					{loading ? (
						<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
					) : (
						<>
							Envoyer <span aria-hidden="true">→</span>
						</>
					)}
				</button>
			</form>

			<div className="mt-3 flex flex-wrap items-center gap-2">
				<span className="text-sm text-stone-500">Idées :</span>
				{SUGGESTIONS.map((s) => (
					<button
						key={s}
						type="button"
						disabled={loading}
						onClick={() => {
							setQuestion(s);
							ask(s);
						}}
						className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm text-stone-600 transition-colors duration-200 hover:border-emerald-300 hover:text-emerald-800 disabled:opacity-50"
					>
						{s}
					</button>
				))}
			</div>

			{loading && slow && (
				<p className="mt-4 text-sm text-stone-600">
					La première réponse prend du temps ? Le serveur backend RAG a un cold-start et est en train de redémarrer, il faut compter 30 solides secondes. Les prochaines réponses iront plus vites ! Pendant ce temps, je t'invite à parcourir mes expériences professionnelles en dessous.
				</p>
			)}

			{error && <p className="mt-4 text-red-600">{error}</p>}

			{answer && (
				<div
					key={answer}
					className="mt-4 animate-[answer-in_0.5s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden rounded-lg border border-emerald-100 bg-white p-4 shadow-lg shadow-emerald-900/5"
				>
					<div className="-mx-4 -mt-4 mb-3 h-1 animate-[shimmer-sweep_1.1s_ease-in-out] bg-gradient-to-r from-emerald-200 via-amber-400 to-emerald-200 bg-[length:200%_100%]" />
					<div className="space-y-3 [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
						<ReactMarkdown>{answer}</ReactMarkdown>
					</div>
				</div>
			)}
		</div>
	);
}
