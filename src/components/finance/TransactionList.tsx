"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Filter } from "lucide-react";

// Mock data for now, will be replaced by real data passed from page
interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
}

interface TransactionListProps {
    transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    const [filter, setFilter] = useState("all");

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold text-white">Transações</h2>
                    <Button variant="outline" size="sm" className="h-8 border-dashed">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtros
                    </Button>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-orange-600 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Nova Transação
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Transação</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 text-zinc-400">
                            {/* Form will go here later */}
                            <p>Formulário de transação em breve...</p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border border-zinc-800 bg-zinc-900/30">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                    Nenhuma transação encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium text-zinc-400">
                                        {new Date(t.date).toLocaleDateString("pt-BR")}
                                    </TableCell>
                                    <TableCell>{t.description}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                                            {t.category}
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className={`text-right font-bold ${t.type === "income" ? "text-emerald-500" : "text-red-500"
                                            }`}
                                    >
                                        {t.type === "expense" ? "-" : "+"}
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(t.amount)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
