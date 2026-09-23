import { useEffect, useState, type FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.PUBLIC_API_URL as string;

export default function Chat() {
	const [question, setQuestion] = useState('');
	const [answer, setAnswer] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [justAnswered, setJustAnswered] = useState(false);
	const [slow, setSlow] = useState(false);

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

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!question.trim() || loading) return;

		setLoading(true);
		setError(null);
		setAnswer(null);

		try {
			const res = await fetch(`${API_URL}/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question }),
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
		<div className="w-full max-w-xl mx-auto">
			<form onSubmit={handleSubmit} className="flex gap-2">
				<div
					className={`flex-1 rounded-lg transition-shadow duration-300 ${
						loading ? 'animate-[glow-pulse_1.4s_ease-in-out_infinite]' : ''
					} ${justAnswered ? 'animate-[success-flash_0.7s_ease-out]' : ''}`}
				>
					<input
						type="text"
						value={question}
						onChange={(e) => setQuestion(e.target.value)}
						placeholder="Pose une question sur Titouan..."
						className="w-full rounded-lg border border-stone-300 px-4 py-2 transition-all duration-300 focus:scale-[1.01] focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-300/50 focus:shadow-[0_0_20px_-4px_rgba(16,185,129,0.6)]"
					/>
				</div>
				<button
					type="submit"
					disabled={loading}
					className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-white transition-all duration-200 hover:scale-105 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-300/50 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
				>
					{loading ? (
						<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
					) : (
						'Envoyer'
					)}
				</button>
			</form>

			{loading && slow && (
				<p className="mt-4 text-sm text-stone-600">
					Votre première question prend du temps ? Le serveur backend RAG a un cold-start et est en train de redémarrer, les prochaines réponses iront plus vites ! Pendant ce temps, je vous invite à parcours mes expériences professionnelles ci-dessous.
				</p>
			)}

			{error && <p className="mt-4 text-red-600">{error}</p>}

			{answer && (
				<div
					key={answer}
					className="mt-4 animate-[answer-in_0.5s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden rounded-lg border border-emerald-100 bg-white p-4 shadow-lg shadow-emerald-900/5"
				>
					<div className="-mx-4 -mt-4 mb-3 h-1 animate-[shimmer-sweep_1.1s_ease-in-out] bg-gradient-to-r from-emerald-200 via-emerald-500 to-emerald-200 bg-[length:200%_100%]" />
					<div className="space-y-3 [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
						<ReactMarkdown>{answer}</ReactMarkdown>
					</div>
				</div>
			)}
		</div>
	);
}
