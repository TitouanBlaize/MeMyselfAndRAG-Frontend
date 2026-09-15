import { useState, type FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.PUBLIC_API_URL as string;

export default function Chat() {
	const [question, setQuestion] = useState('');
	const [answer, setAnswer] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
				<input
					type="text"
					value={question}
					onChange={(e) => setQuestion(e.target.value)}
					placeholder="Pose une question sur Titouan..."
					className="flex-1 rounded-lg border border-stone-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
				/>
				<button
					type="submit"
					disabled={loading}
					className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50"
				>
					{loading ? '...' : 'Envoyer'}
				</button>
			</form>

			{error && <p className="mt-4 text-red-600">{error}</p>}

			{answer && (
				<div className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
					<div className="space-y-3 [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
						<ReactMarkdown>{answer}</ReactMarkdown>
					</div>
				</div>
			)}
		</div>
	);
}
