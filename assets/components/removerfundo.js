// RemoverFundo.js
import React from 'react';
import iconLoadingIA from '../../assets/imagens/ialoading.gif';

function RemoverFundo({
  loadingIA,
  loadingUpload,
  showModal,
  setShowModal,
  processarImagem,
  previewIA,
  confirmarUsoImagemIA,
  setPreviewIA
}) {

  if (!showModal) return null;

  const emLoading = loadingIA || loadingUpload;

  return (
    <>
      <div className="modal-backdrop-custom"></div>

      <div className="modal fade show d-block" style={{ zIndex: 9999999 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">

            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title">Imagem do Produto</h5>
              <button
                className="btn-close"
                disabled={emLoading}
                onClick={() => setShowModal(false)}
              />
            </div>

            {/* LOADING IA */}
            {loadingIA && (
              <div className="text-center p-5">
                <img src={iconLoadingIA} width="130" alt="Loading IA" />
                <div className="mt-4">Removendo fundo...</div>
              </div>
            )}

            {/* LOADING UPLOAD NORMAL */}
            {loadingUpload && (
              <div className="text-center p-5">
                <i class="fa-solid fa-download fa-beat-fade fa-2x"></i>
                <div className="mt-4">Enviando imagem...</div>
              </div>
            )}

            {/* PREVIEW IA */}
            {!emLoading && previewIA && (
              <>
                <div className="modal-body text-center">
                  <p>Esse é o resultado. Deseja usar essa imagem?</p>
                  <img
                    src={previewIA}
                    style={{ maxWidth: '100%', maxHeight: 300 }}
                    alt="Preview IA"
                  />
                </div>

                <div className="modal-footer d-flex justify-content-between">
                  <button
                    className="botao2"
                    onClick={() => setPreviewIA(null)}
                  >
                    Cancelar
                  </button>

                  <button
                    className="botao"
                    onClick={confirmarUsoImagemIA}
                  >
                    Usar essa imagem
                  </button>
                </div>
              </>
            )}

            {/* PERGUNTA INICIAL */}
            {!emLoading && !previewIA && (
              <>
                <div className="modal-body">
                  <p>Deseja remover o fundo da imagem usando IA?</p>
                </div>

                <div className="modal-footer d-flex justify-content-between">
                  <button
                    className="botao2"
                    disabled={emLoading}
                    onClick={() => processarImagem(false)}
                  >
                    Não
                  </button>

                  <button
                    className="botao"
                    disabled={emLoading}
                    onClick={() => processarImagem(true)}
                  >
                    Sim
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default RemoverFundo;
