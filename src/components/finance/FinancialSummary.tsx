import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign } from "lucide-react";

interface FinancialSummaryProps {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
}

export function FinancialSummary({
    totalBalance,
    monthlyIncome,
    monthlyExpense,
}: FinancialSummaryProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">
                        Saldo Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">
                        {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(totalBalance)}
                    </div>
                    <p className="text-xs text-zinc-500">Atualizado agora</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">
                        Receitas (Mês)
                    </CardTitle>
                    <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-500">
                        {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(monthlyIncome)}
                    </div>
                    <p className="text-xs text-zinc-500">+20.1% em relação ao mês passado</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">
                        Despesas (Mês)
                    </CardTitle>
                    <ArrowDownIcon className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                        {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(monthlyExpense)}
                    </div>
                    <p className="text-xs text-zinc-500">-4% em relação ao mês passado</p>
                </CardContent>
            </Card>
        </div>
    );
}
