import sys

def main():
    file_path = 'd:/diskusi-bisnis/frontend/components/pages/QuestionDetailClient.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    start_idx = 756
    end_idx = 770
    
    new_lines = [
        '                                    <div className="flex items-center gap-4">\n',
        '                                        <button\n',
        '                                            onClick={scrollToAnswerComposer}\n',
        '                                            className="flex items-center gap-1.5 text-[13px] text-gray-500 font-medium hover:text-emerald-600 transition-colors"\n',
        '                                        >\n',
        '                                            <MessageSquare className="w-4 h-4" />\n',
        '                                            <span>{question.answers?.length ?? question.answers_count ?? 0}</span>\n',
        '                                        </button>\n',
        '                                        <button\n',
        '                                            onClick={handleShare}\n',
        '                                            className="flex items-center gap-2 text-[13px] text-gray-500 font-medium hover:text-emerald-600 transition-colors"\n',
        '                                        >\n',
        '                                            <Share2 className="w-4 h-4" />\n',
        '                                        </button>\n',
        '                                    </div>\n',
        '                                </div>\n'
    ]
    
    lines[start_idx:end_idx] = new_lines
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

if __name__ == '__main__':
    main()
