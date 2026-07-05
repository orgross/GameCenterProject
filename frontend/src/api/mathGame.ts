import { apiGet, apiPostJson } from "./client";

export type Difficulty = "easy" | "medium" | "hard";

export interface ProblemOut {
  problem_id: string;
  expression: string;
  difficulty: Difficulty;
}

export interface AnswerOut {
  correct: boolean;
  correct_answer: number;
}

export function fetchProblem(difficulty: Difficulty): Promise<ProblemOut> {
  return apiGet<ProblemOut>(`/games/math/problem?difficulty=${difficulty}`);
}

export function submitAnswer(problemId: string, answer: number): Promise<AnswerOut> {
  return apiPostJson<AnswerOut>("/games/math/answer", { problem_id: problemId, answer });
}
