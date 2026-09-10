import React from 'react';
import type { DocumentControl, CheckRecord, Company } from '../types';

interface PrintableDocumentProps {
  company: Company;
  control: DocumentControl;
  records: CheckRecord[];
  month: number;
  year: number;
}

export const PrintableDocument: React.FC<PrintableDocumentProps> = ({
  company,
  control,
  records,
  month,
  year
}) => {
  const monthNames = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];

  const totalDays = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const sectorTaskGroups = control.sectors.map(sec => ({
    sector: sec,
    tasks: control.tasks.filter(t => t.sectorId === sec.id && t.active)
  })).filter(g => g.tasks.length > 0);

  const allActiveTasks = sectorTaskGroups.flatMap(g => g.tasks);

  const distinctDailyTimes = React.useMemo(() => {
    const timesSet = new Set<string>();
    allActiveTasks.forEach(task => {
      if (task.scheduledTimes && task.scheduledTimes.length > 0) {
        task.scheduledTimes.forEach(t => timesSet.add(t));
      } else if (task.scheduledTime) {
        timesSet.add(task.scheduledTime);
      }
    });
    return Array.from(timesSet).sort();
  }, [allActiveTasks]);

  const hasMultiTimeChecks = React.useMemo(() => {
    return allActiveTasks.some(t => t.scheduledTimes && t.scheduledTimes.length > 1);
  }, [allActiveTasks]);

  const recordMap = new Map<string, CheckRecord>();
  records
    .filter(r => r.controlId === control.id && r.month === month && r.year === year)
    .forEach(r => {
      if (r.scheduledTime) {
        recordMap.set(`${r.dayNumber}-${r.taskId}-${r.scheduledTime}`, r);
      }
      if (!recordMap.has(`${r.dayNumber}-${r.taskId}`)) {
        recordMap.set(`${r.dayNumber}-${r.taskId}`, r);
      }
    });

  return (
    <div className="hidden print:block w-full bg-white text-black p-2 font-sans text-[9px] leading-tight">
      {/* Header Container */}
      <div className="border-2 border-black mb-1">
        {/* Row 1 */}
        <div className="grid grid-cols-12 border-b-2 border-black">
          <div className="col-span-3 p-1.5 border-r-2 border-black flex items-center justify-center min-h-[45px]">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="max-h-10 max-w-full object-contain" />
            ) : (
              <span className="text-2xl font-serif font-bold tracking-tight">{company.name}</span>
            )}
          </div>
          <div className="col-span-6 p-2 border-r-2 border-black flex items-center justify-center font-bold text-sm tracking-wider text-center">
            {control.documentType}
          </div>
          <div className="col-span-3 p-1.5 text-center text-[9px] flex flex-col justify-center">
            <div className="font-bold">{control.docCode}</div>
            <div>{control.revision}</div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-12">
          <div className="col-span-9 p-2 border-r-2 border-black flex items-center justify-center font-bold text-xs tracking-wide text-center uppercase">
            {control.title} - {monthNames[month - 1]} / {year}
          </div>
          <div className="col-span-3 p-1.5 text-[9px] flex flex-col justify-center">
            <div className="font-bold">{control.popRef}</div>
            <div>Emissão: {control.emissionDate}</div>
          </div>
        </div>
      </div>

      {/* Table Matrix */}
      <table className="w-full border-collapse border-2 border-black text-center text-[8px]">
        <thead>
          <tr className="bg-gray-100 border-b border-black font-bold">
            <th rowSpan={2} className="w-8 border-r-2 border-black bg-gray-200">DIA</th>
            {hasMultiTimeChecks && (
              <th rowSpan={2} className="w-14 border-r-2 border-black bg-gray-200">HORÁRIO</th>
            )}
            {sectorTaskGroups.map((group, gIdx) => (
              <th 
                key={group.sector.id}
                colSpan={group.tasks.length}
                className={`p-1 uppercase ${
                  gIdx < sectorTaskGroups.length - 1 ? 'border-r-2 border-black' : ''
                }`}
              >
                {group.sector.name}
              </th>
            ))}
          </tr>

          <tr className="border-b-2 border-black font-semibold">
            {sectorTaskGroups.map((group, gIdx) => (
              group.tasks.map((t, tIdx) => {
                const isSectorLast = tIdx === group.tasks.length - 1;
                const isVeryLast = isSectorLast && gIdx === sectorTaskGroups.length - 1;

                return (
                  <th 
                    key={t.id} 
                    className={`p-1 w-16 align-top ${
                      isVeryLast ? '' : isSectorLast ? 'border-r-2 border-r-black' : 'border-r border-gray-400'
                    }`}
                  >
                    <div className="min-h-[45px] flex flex-col justify-between">
                      <span>{t.name}</span>
                      {control.showColumnTimes !== false && !hasMultiTimeChecks && t.hasScheduledTime !== false && t.scheduledTime && (
                        <span className="text-[7px] font-normal text-gray-600 mt-0.5">🕒 {t.scheduledTime}</span>
                      )}
                    </div>
                  </th>
                );
              })
            ))}
          </tr>

          <tr className="bg-gray-50 border-b border-black font-bold text-[8px]">
            <td className="bg-gray-200 border-r-2 border-black"></td>
            {hasMultiTimeChecks && <td className="bg-gray-200 border-r-2 border-black"></td>}
            <td 
              colSpan={allActiveTasks.length}
              className="py-0.5 tracking-wider uppercase text-center"
            >
              RESPONSÁVEL PELA EXECUÇÃO DAS ATIVIDADES
            </td>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-400 font-mono">
          {daysArray.map((day) => {
            const dayDate = new Date(year, month - 1, day);
            const dayOfWeek = dayDate.getDay();
            const dayTimeSlots = hasMultiTimeChecks ? distinctDailyTimes : [null];

            return dayTimeSlots.map((timeSlot, timeIdx) => {
              const isFirstSlotOfDay = timeIdx === 0;

              return (
                <tr key={`${day}-${timeSlot || 'slot'}`} className="h-5">
                  {isFirstSlotOfDay && (
                    <td 
                      rowSpan={dayTimeSlots.length} 
                      className="border-r-2 border-black font-bold bg-gray-100 align-middle"
                    >
                      {day}
                    </td>
                  )}

                  {hasMultiTimeChecks && (
                    <td className="border-r-2 border-black font-mono font-bold text-[7.5px] bg-gray-50">
                      {timeSlot}
                    </td>
                  )}

                  {sectorTaskGroups.map((group, gIdx) => (
                    group.tasks.map((task, tIdx) => {
                      const targetTime = timeSlot || (task.hasScheduledTime !== false ? task.scheduledTime : undefined);
                      const isMultiCheckTask = !!(task.scheduledTimes && task.scheduledTimes.length > 1);
                      const rec = (targetTime ? recordMap.get(`${day}-${task.id}-${targetTime}`) : undefined) 
                        || (!isMultiCheckTask ? recordMap.get(`${day}-${task.id}`) : undefined);
                      const isSectorLast = tIdx === group.tasks.length - 1;
                      const isVeryLast = isSectorLast && gIdx === sectorTaskGroups.length - 1;
                      const borderClass = isVeryLast ? '' : isSectorLast ? 'border-r-2 border-r-black' : 'border-r border-gray-400';

                      const isTimeApplicable = !timeSlot || (task.hasScheduledTime === false) || (task.scheduledTimes ? task.scheduledTimes.includes(timeSlot) : task.scheduledTime === timeSlot);

                      if (!isTimeApplicable) {
                        return <td key={task.id} className={`bg-gray-100 ${borderClass}`}>—</td>;
                      }

                      return (
                        <td key={task.id} className={`p-0 text-center ${borderClass}`}>
                          {rec ? `[ ${rec.userInitials} ${rec.checkedTime} ]` : '[   ]'}
                        </td>
                      );
                    })
                  ))}
                </tr>
              );
            });
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-1 flex items-center justify-between text-[8px] border-t border-black pt-1">
        <div>{control.confidentialText}</div>
        <div>Impressão em: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  );
};
