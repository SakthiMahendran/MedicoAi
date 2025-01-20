from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import FileAnalyzerSerializer
from .handlers import AIHandler


class ChatView(APIView):
    """
    Handles file upload for embedding generation and querying.
    """
    permission_classes = [AllowAny]

    # Shared AIHandler instance for this view
    ai_handler = AIHandler()

    def post(self, request):
        """
        Upload a document and generate embeddings.
        """
        serializer = FileAnalyzerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        file = serializer.validated_data["file"]

        try:
            # Extract content from the file
            file_content = file.read().decode("utf-8") if file.content_type == "text/plain" else None
            if not file_content:
                file_content = self.ai_handler.extract_content(file, file.content_type)

            # Generate embeddings for the extracted content
            self.ai_handler.generate_embeddings(file_content)

            return Response(
                {"message": "File uploaded and embeddings generated successfully."},
                status=status.HTTP_200_OK,
            )
        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except RuntimeError as re:
            return Response({"error": str(re)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get(self, request):
        """
        Query AI using the embeddings generated from the uploaded document.
        """
        query = request.query_params.get("query")
        if not query:
            return Response(
                {"error": "Query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Query AIHandler for response
            response = self.ai_handler.query_ai(query)

            return Response({"response": response}, status=status.HTTP_200_OK)
        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except RuntimeError as re:
            return Response({"error": str(re)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
