import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Search, BookOpen, Eye, Brain } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set worker URL for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFs = () => {
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPDFs();
  }, []);

  useEffect(() => {
    if (selectedPDF) {
      const selectedPdfData = pdfs.find(pdf => pdf.id === selectedPDF);
      if (selectedPdfData?.file_path) {
        const url = supabase.storage
          .from('course-materials')
          .getPublicUrl(selectedPdfData.file_path)
          .data.publicUrl;
        setPdfUrl(url);
        setPageNumber(1);
      }
    }
  }, [selectedPDF, pdfs]);

  const fetchPDFs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get all lessons with PDF type
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select(`
          *,
          courses!inner(
            id,
            title,
            user_id
          )
        `)
        .eq('type', 'pdf')
        .eq('courses.user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const pdfData = lessons?.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        file_path: lesson.file_path,
        course_title: lesson.courses.title,
        created_at: lesson.created_at,
        pages: 0, // We'll calculate this when PDF loads
        size: 'Unknown' // We'll get this from storage if needed
      })) || [];

      setPdfs(pdfData);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
    
    // Update the PDF data with page count
    setPdfs(prev => prev.map(pdf => 
      pdf.id === selectedPDF 
        ? { ...pdf, pages: numPages }
        : pdf
    ));
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfError('Failed to load PDF. Please try again later.');
  };

  const filteredPdfs = pdfs.filter(pdf =>
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pdf.course_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPdfData = pdfs.find(pdf => pdf.id === selectedPDF);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-primary mb-4">PDF Learning Materials</h1>
          <p className="text-gray-600">
            Access and interact with your course materials in PDF format with AI-enhanced features
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* PDF List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-primary">Your PDFs</h2>
                <span className="text-sm text-gray-500">{filteredPdfs.length} files</span>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search PDFs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                {filteredPdfs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No PDF files found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload course materials from the dashboard
                    </p>
                  </div>
                ) : (
                  filteredPdfs.map((pdf) => (
                    <button
                      key={pdf.id}
                      onClick={() => setSelectedPDF(pdf.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                        selectedPDF === pdf.id
                          ? 'bg-secondary/10 border-secondary'
                          : 'bg-gray-50 hover:bg-gray-100'
                      } border-2`}
                    >
                      <div className="flex items-start space-x-3">
                        <FileText className={`w-6 h-6 ${
                          selectedPDF === pdf.id ? 'text-secondary' : 'text-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-primary truncate">{pdf.title}</h3>
                          <p className="text-sm text-gray-600 truncate">{pdf.course_title}</p>
                          <div className="text-sm text-gray-500 mt-1">
                            {pdf.pages > 0 && (
                              <>
                                <span>{pdf.pages} pages</span>
                                <span className="mx-2">•</span>
                              </>
                            )}
                            <span>{new Date(pdf.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="lg:col-span-2">
            {selectedPDF && selectedPdfData ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-primary">
                        {selectedPdfData.title}
                      </h2>
                      <p className="text-gray-600">{selectedPdfData.course_title}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg text-secondary"
                        title="AI Analysis"
                      >
                        <Brain className="w-5 h-5" />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        onClick={() => window.open(pdfUrl, '_blank')}
                        title="Open in new tab"
                      >
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
                      <a
                        href={pdfUrl || '#'}
                        download
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5 text-gray-600" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {pdfError ? (
                    <div className="text-center py-8">
                      <div className="text-red-600 mb-4">
                        <FileText className="w-12 h-12 mx-auto mb-2" />
                        <p>{pdfError}</p>
                      </div>
                      <button 
                        onClick={() => window.open(pdfUrl, '_blank')}
                        className="btn-secondary"
                      >
                        Open in New Tab
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                          <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                          </div>
                        }
                      >
                        <Page 
                          pageNumber={pageNumber} 
                          width={Math.min(window.innerWidth * 0.5, 800)}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                        />
                      </Document>
                      
                      {numPages && (
                        <div className="flex items-center justify-between w-full max-w-md mt-6">
                          <button
                            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                            disabled={pageNumber <= 1}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600">
                              Page {pageNumber} of {numPages}
                            </span>
                            <input
                              type="number"
                              min="1"
                              max={numPages}
                              value={pageNumber}
                              onChange={(e) => {
                                const page = parseInt(e.target.value);
                                if (page >= 1 && page <= numPages) {
                                  setPageNumber(page);
                                }
                              }}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                            />
                          </div>
                          
                          <button
                            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                            disabled={pageNumber >= numPages}
                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* AI Features */}
                <div className="border-t p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold text-primary mb-3">AI-Enhanced Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 text-center">
                      <Brain className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <span className="text-sm text-gray-700">Summarize</span>
                    </button>
                    <button className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 text-center">
                      <BookOpen className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <span className="text-sm text-gray-700">Flashcards</span>
                    </button>
                    <button className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 text-center">
                      <FileText className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <span className="text-sm text-gray-700">Quiz</span>
                    </button>
                    <button className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-all duration-300 text-center">
                      <Search className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <span className="text-sm text-gray-700">Search</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Select a PDF
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose a PDF from the list to start reading with AI-enhanced features
                </p>
                <p className="text-sm text-gray-500">
                  Upload new course materials from your dashboard to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFs;