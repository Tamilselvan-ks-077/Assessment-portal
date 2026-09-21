import React, { useEffect, useState } from 'react';
import { storageService } from '../../utils/storage';
import { ParticipantRecord } from '../../types';
import {
  Button,
  Card,
  Badge,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Drawer,
  LoadingSpinner,
  EmptyState,
} from '../../components/ui';
import {
  Users2,
  Search,
  Award,
  Calendar,
  Mail,
  FileCheck2,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const ParticipantsPage: React.FC = () => {
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantRecord | null>(null);

  useEffect(() => {
    setIsLoading(true);
    try {
      const data = storageService.getParticipants();
      setParticipants(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner size="lg" label="Loading participant directory..." />
      </div>
    );
  }

  const filtered = participants.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.studentId && p.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Participants Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View longitudinal performance history, pass rates, and individual score records.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <Card className="p-4">
        <Input
          placeholder="Search by candidate name, email, or student ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </Card>

      {/* Participants Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No participants found"
          description="Participants will automatically register in this directory upon starting an assessment."
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Total Tests</TableHead>
                <TableHead>Passed</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">History</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.email}</div>
                    {p.studentId && (
                      <div className="text-[10px] text-slate-400 font-mono">ID: {p.studentId}</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">
                    {p.totalAttempts} {p.totalAttempts === 1 ? 'Attempt' : 'Attempts'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.passedAttempts > 0 ? 'success' : 'danger'} size="sm">
                      {p.passedAttempts} Passed
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-slate-900">{p.averageScore}%</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {formatDate(p.lastAttemptDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedParticipant(p)}
                      leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-600" />}
                    >
                      View Tests
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Candidate History Drawer */}
      {selectedParticipant && (
        <Drawer
          isOpen={!!selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
          title={`Candidate Record: ${selectedParticipant.name}`}
          size="md"
        >
          <div className="space-y-6">
            {/* Candidate Header summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="text-sm font-bold text-slate-900">{selectedParticipant.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {selectedParticipant.email}
              </div>
              {selectedParticipant.studentId && (
                <div className="text-xs text-slate-500 font-mono">
                  ID: {selectedParticipant.studentId}
                </div>
              )}
            </div>

            {/* Assessment History list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Assessments Completed
              </h4>

              <div className="space-y-2.5">
                {selectedParticipant.assessmentsTaken.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-semibold text-xs text-slate-900 leading-snug">
                        {item.assessmentTitle}
                      </h5>
                      <Badge variant={item.isPassed ? 'success' : 'danger'} size="sm">
                        {item.score}%
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
