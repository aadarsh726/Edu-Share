// import React from 'react';
// import { Card, Button, Badge } from 'react-bootstrap';
// import { 
//     FileEarmarkPdfFill, 
//     FileEarmarkWordFill, 
//     FileEarmarkPptFill, 
//     FileEarmarkTextFill, 
//     Download 
// } from 'react-bootstrap-icons';
// import { saveAs } from 'file-saver'; 
// //new added
// const ResourceCard = ({ resource }) => {
    
//     // --- THIS IS THE CRITICAL FIX ---
//     // If the resource object is missing, don't render the component yet.
//     if (!resource || !resource.fileType) {
//         return null;
//     }

//     const getFileIcon = (fileType) => {
//     // --- THIS IS THE SAFE FIX ---
//     const type = fileType ? fileType.toLowerCase() : '';
    
//     if (type.includes('pdf')) return <FileEarmarkPdfFill size={30} className="text-danger" />;
//     if (type.includes('word') || type.includes('doc')) return <FileEarmarkWordFill size={30} className="text-primary" />;
//     if (type.includes('powerpoint') || type.includes('ppt')) return <FileEarmarkPptFill size={30} className="text-warning" />;
    
//     // Default icon for unknown types
//     return <FileEarmarkTextFill size={30} className="text-secondary" />;
// };
// // const getFileIcon = (fileType) => {
// //     if (fileType.includes('pdf')) return <FileEarmarkPdfFill size={30} className="text-danger" />;
// //     if (fileType.includes('word')) return <FileEarmarkWordFill size={30} className="text-primary" />;
// //     if (fileType.includes('powerpoint')) return <FileEarmarkPptFill size={30} className="text-warning" />;
// //     return <FileEarmarkTextFill size={30} className="text-secondary" />;
// // };

// const ResourceCard = ({ resource }) => {

//     // This is the download function that works perfectly
//     const handleDownload = () => {
//         try {
//             // This works because file-saver handles the security headers
//             saveAs(resource.fileUrl, resource.originalFilename); 
//         } catch (err) {
//             console.error('Download error', err);
//             alert('Download failed.');
//         }
//     };

//     return (
//         <Card className="bg-transparent card-hover-glow h-100"> 
//             <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
//                 <Badge bg="primary">{resource.subject}</Badge>
//                 {getFileIcon(resource.fileType)}
//             </Card.Header>
//             <Card.Body>
//                 <Card.Title className="fw-bold">{resource.title}</Card.Title>
//                 <Card.Text> 
//                     {resource.description || "No description provided."}
//                 </Card.Text>
//             </Card.Body>

//             {/* We now have only ONE button. It works perfectly. */}
//             <Card.Footer className="text-center bg-transparent">
                
//                 <Button 
//                     variant="primary" 
//                     className="fw-bold"
//                     onClick={handleDownload} 
//                     title="Download"
//                 >
//                     <Download className="me-2" /> Download
//                 </Button>
                
//             </Card.Footer>
//         </Card>
//     );
// }};

// export default ResourceCard;
import React, { useContext } from 'react';
import { Card, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { 
    FileEarmarkPdfFill, 
    FileEarmarkWordFill, 
    FileEarmarkPptFill, 
    FileEarmarkTextFill, 
    Download 
} from 'react-bootstrap-icons';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
// We do not need file-saver

const getFileIcon = (mimeType) => {
    const type = typeof mimeType === 'string' ? mimeType.toLowerCase() : '';
    
    if (type.includes('pdf')) return <FileEarmarkPdfFill size={30} className="text-danger" />;
    if (type.includes('word') || type.includes('doc')) return <FileEarmarkWordFill size={30} className="text-primary" />;
    if (type.includes('powerpoint') || type.includes('ppt')) return <FileEarmarkPptFill size={30} className="text-warning" />;
    return <FileEarmarkTextFill size={30} className="text-secondary" />;
};

const ResourceCard = ({ resource, onDeleted, showToast }) => {

    if (!resource || !resource.mimeType) {
        return null; 
    }

    const { auth } = useContext(AuthContext);

    // The backend URL
    const BACKEND_URL = 'http://localhost:5000';
    
    // The server download route (e.g., /api/resources/123abc/download)
    const serverFileUrl = resource.fileUrl; 

    return (
        <Card className="bg-transparent card-hover-glow h-100"> 
            <Card.Header className="d-flex justify-content-between align-items-center bg-transparent">
                <Badge bg="primary">{resource.subject}</Badge>
                {getFileIcon(resource.mimeType)}
            </Card.Header>
            <Card.Body>
                <Card.Title className="fw-bold">{resource.title}</Card.Title>
                <Card.Text> 
                    {resource.description || "No description provided."}
                </Card.Text>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between bg-transparent">
                <Button 
                    variant="primary" 
                    className="fw-bold"
                    href={`${BACKEND_URL}${serverFileUrl}`}
                    title="Download"
                >
                    <Download className="me-2" /> Download
                </Button>

                {auth?.user?.role === 'teacher' && (
                    <Button 
                        variant="danger"
                        className="fw-bold"
                        onClick={async () => {
                            try {
                                await api.delete(`/resources/${resource._id}` , {
                                    headers: { Authorization: `Bearer ${auth.token}` }
                                });
                                showToast && showToast('success', 'Resource deleted successfully!');
                                onDeleted && onDeleted(resource._id);
                            } catch (e) {
                                showToast && showToast('error', 'Failed to delete resource. Please try again.');
                            }
                        }}
                    >
                        Delete
                    </Button>
                )}
            </Card.Footer>
        </Card>
    );
};

export default ResourceCard;