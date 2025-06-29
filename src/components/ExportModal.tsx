import { useState } from 'react';
import { X, Download, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import type { EventRequest, ContactMessage } from '../types/supabase';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventRequest[];
  messages: ContactMessage[];
}

export function ExportModal({ isOpen, onClose, events, messages }: ExportModalProps) {
  const [exportType, setExportType] = useState<'events' | 'messages' | 'both'>('events');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'ongoing' | 'completed'>('all');
  const [viewedFilter, setViewedFilter] = useState<'all' | 'viewed' | 'new'>('all');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const workbook = XLSX.utils.book_new();
      
      // Filter events based on criteria
      let filteredEvents = events;
      if (dateRange.startDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.created_at) >= new Date(dateRange.startDate)
        );
      }
      if (dateRange.endDate) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.created_at) <= new Date(dateRange.endDate)
        );
      }
      if (statusFilter !== 'all') {
        filteredEvents = filteredEvents.filter(event => event.status === statusFilter);
      }

      // Filter messages based on criteria
      let filteredMessages = messages;
      if (dateRange.startDate) {
        filteredMessages = filteredMessages.filter(message => 
          new Date(message.created_at) >= new Date(dateRange.startDate)
        );
      }
      if (dateRange.endDate) {
        filteredMessages = filteredMessages.filter(message => 
          new Date(message.created_at) <= new Date(dateRange.endDate)
        );
      }
      if (viewedFilter !== 'all') {
        filteredMessages = filteredMessages.filter(message => 
          viewedFilter === 'viewed' ? message.viewed : !message.viewed
        );
      }

      // Export events
      if (exportType === 'events' || exportType === 'both') {
        const eventsData = filteredEvents.map((event, index) => ({
          'S.No': index + 1,
          'Event ID': event.id,
          'Client Name': event.name,
          'Email': event.email,
          'Phone': event.phone,
          'Event Type': event.event_type.toUpperCase(),
          'Event Date': new Date(event.event_date).toLocaleDateString('en-IN'),
          'Guest Count': event.guest_count,
          'Requirements': event.requirements || 'None',
          'Status': event.status.toUpperCase(),
          'Priority': event.status === 'pending' ? 'HIGH' : event.status === 'ongoing' ? 'MEDIUM' : 'LOW',
          'Submission Date': new Date(event.created_at).toLocaleDateString('en-IN'),
          'Submission Time': new Date(event.created_at).toLocaleTimeString('en-IN'),
          'Days Since Submission': Math.floor((new Date().getTime() - new Date(event.created_at).getTime()) / (1000 * 60 * 60 * 24))
        }));

        const eventsSheet = XLSX.utils.json_to_sheet(eventsData);
        
        // Set column widths and styles
        eventsSheet['!cols'] = [
          { wch: 8 },   // S.No
          { wch: 40 },  // Event ID
          { wch: 20 },  // Client Name
          { wch: 25 },  // Email
          { wch: 15 },  // Phone
          { wch: 15 },  // Event Type
          { wch: 12 },  // Event Date
          { wch: 12 },  // Guest Count
          { wch: 30 },  // Requirements
          { wch: 12 },  // Status
          { wch: 10 },  // Priority
          { wch: 15 },  // Submission Date
          { wch: 15 },  // Submission Time
          { wch: 20 }   // Days Since Submission
        ];

        // Add conditional formatting for status
        const range = XLSX.utils.decode_range(eventsSheet['!ref'] || 'A1');
        for (let row = 1; row <= range.e.r; row++) {
          const statusCell = eventsSheet[XLSX.utils.encode_cell({ r: row, c: 9 })]; // Status column
          if (statusCell && statusCell.v) {
            switch (statusCell.v) {
              case 'PENDING':
                statusCell.s = { fill: { fgColor: { rgb: 'FFF3CD' } }, font: { color: { rgb: '856404' } } };
                break;
              case 'ONGOING':
                statusCell.s = { fill: { fgColor: { rgb: 'D1ECF1' } }, font: { color: { rgb: '0C5460' } } };
                break;
              case 'COMPLETED':
                statusCell.s = { fill: { fgColor: { rgb: 'D4EDDA' } }, font: { color: { rgb: '155724' } } };
                break;
            }
          }
        }

        XLSX.utils.book_append_sheet(workbook, eventsSheet, 'Event Requests');
      }

      // Export messages
      if (exportType === 'messages' || exportType === 'both') {
        const messagesData = filteredMessages.map((message, index) => ({
          'S.No': index + 1,
          'Message ID': message.id,
          'Sender Name': message.name,
          'Email': message.email,
          'Message': message.message,
          'Status': message.viewed ? 'VIEWED' : 'NEW',
          'Character Count': message.message.length,
          'Submission Date': new Date(message.created_at).toLocaleDateString('en-IN'),
          'Submission Time': new Date(message.created_at).toLocaleTimeString('en-IN'),
          'Days Since Submission': Math.floor((new Date().getTime() - new Date(message.created_at).getTime()) / (1000 * 60 * 60 * 24))
        }));

        const messagesSheet = XLSX.utils.json_to_sheet(messagesData);
        
        // Set column widths
        messagesSheet['!cols'] = [
          { wch: 8 },   // S.No
          { wch: 40 },  // Message ID
          { wch: 20 },  // Sender Name
          { wch: 25 },  // Email
          { wch: 50 },  // Message
          { wch: 10 },  // Status
          { wch: 15 },  // Character Count
          { wch: 15 },  // Submission Date
          { wch: 15 },  // Submission Time
          { wch: 20 }   // Days Since Submission
        ];

        XLSX.utils.book_append_sheet(workbook, messagesSheet, 'Contact Messages');
      }

      // Add summary sheet
      const summaryData = [
        { 'Metric': 'Total Events Exported', 'Value': exportType === 'messages' ? 0 : filteredEvents.length },
        { 'Metric': 'Total Messages Exported', 'Value': exportType === 'events' ? 0 : filteredMessages.length },
        { 'Metric': 'Export Date', 'Value': new Date().toLocaleString('en-IN') },
        { 'Metric': 'Export Type', 'Value': exportType.toUpperCase() },
        { 'Metric': 'Date Range', 'Value': dateRange.startDate && dateRange.endDate ? `${dateRange.startDate} to ${dateRange.endDate}` : 'All Time' },
        { 'Metric': 'Status Filter', 'Value': statusFilter.toUpperCase() },
        { 'Metric': 'Message Filter', 'Value': viewedFilter.toUpperCase() }
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Export Summary');

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `mavryck-events-${exportType}-export-${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);
      
      toast.success(`Export completed! Downloaded as ${filename}`);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-gray-800 rounded-xl max-w-2xl w-full p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-white">Advanced Export</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Export Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'events', label: 'Events Only', count: events.length },
                { value: 'messages', label: 'Messages Only', count: messages.length },
                { value: 'both', label: 'Both', count: events.length + messages.length }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExportType(option.value as any)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    exportType === option.value
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-75">({option.count} items)</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Date Range (Optional)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Status Filter */}
            {(exportType === 'events' || exportType === 'both') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Event Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Only</option>
                  <option value="ongoing">Ongoing Only</option>
                  <option value="completed">Completed Only</option>
                </select>
              </div>
            )}

            {/* Message Viewed Filter */}
            {(exportType === 'messages' || exportType === 'both') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Message Status Filter</label>
                <select
                  value={viewedFilter}
                  onChange={(e) => setViewedFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Messages</option>
                  <option value="new">New Only</option>
                  <option value="viewed">Viewed Only</option>
                </select>
              </div>
            )}
          </div>

          {/* Export Features */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Export Features</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Color-coded status indicators</li>
              <li>• Automatic calculations (days since submission, character counts)</li>
              <li>• Optimized column widths for readability</li>
              <li>• Summary sheet with export metadata</li>
              <li>• Sequential numbering for easy reference</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-6 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export Data
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}